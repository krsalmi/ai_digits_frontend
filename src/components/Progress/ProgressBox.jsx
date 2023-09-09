import React, { useState, useEffect, useRef } from "react";
import classes from './Progress.module.css';
import { WAITING } from "../../utils/constants";
import { API_ENDPOINTS } from "../../utils/constants";
import LoadingDots from "../LoadingDots/LoadingDots";
import ProgressBar from "./ProgressBar";


const ProgressBox = ({endTraining}) => {
    const [accuracyLines, setAccuracyLines] = useState(new Set());
    const [percentage, setPercentage] = useState(0);
    const savedEpochRef = useRef(0);
    const maxEpochs = useRef(0);
    const [cancellingTraining, setCancellingTraining] = useState(false);
    const stopWasClicked = useRef(false);

    const stopTraining = async () => {
        const response = await fetch(API_ENDPOINTS.STOP_TRAINING);

        if (response.ok) {
            console.log("Stop signal successfully sent")
            stopWasClicked.current = true;
            setCancellingTraining(true);
        } else {
            console.log("Problem sending stop signal")
        }
    }

    useEffect(() => {
        const eventSource = new EventSource(API_ENDPOINTS.PROGRESS_SSE);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Update progress if it's not a close event
            if (data.event !== "close") {
                // Set max num of epochs
                if (!maxEpochs.current && 'max_epochs' in data && !isNaN(data.max_epochs)) {
                    maxEpochs.current = parseInt(data.max_epochs)
                }
                setPercentage(data.percentage);
                if (('epoch' && 'accuracy') in data) {
                    try {
                        const currentEpoch = parseInt(data.epoch);
                        if (currentEpoch !== savedEpochRef.current) {
                            const newAccuracyLine = {
                                epoch: currentEpoch,
                                accuracy: data.accuracy
                            }
                            setAccuracyLines(prev => {
                                const updatedLines = [...prev, newAccuracyLine];
                                return updatedLines;
                            });
                            savedEpochRef.current = currentEpoch;
                        }
                    } catch {
                        console.log("Failed to parse epoch");
                    }
                }
            } else {
                // Handle close event
                console.log(`Connection closed due to: ${data.reason}`);
                eventSource.close();
                endTraining(data.reason);

            }
        };

        eventSource.onerror = (event) => {
            if (event.target.readyState === EventSource.CLOSED) {
                console.log('SSE closed');
            } else {
                console.log('SSE error:', event);
            }
        };

        return () => {
            eventSource.close();  // Ensure the connection is closed if component is unmounted
        };
    }, []);



    const isDisabled = stopWasClicked.current;

    return (
        <div className={classes.progressDiv}>
            <div className={classes.titleButtonDiv}>
                <div className={classes.titleDiv}>
                    <h5 className={classes.title}>{!cancellingTraining ? WAITING.TRAINING : WAITING.CANCEL}</h5>
                </div>
                <LoadingDots />
                <button className={`${classes.buttonClass} btn`} onClick={stopTraining} disabled={isDisabled}>CANCEL TRAINING</button>
            </div>
            <h6>{WAITING.EPOCH}</h6>
            {accuracyLines.length > 0 && 
                accuracyLines.map((line) => (
                    <p className={classes.progressRow} key={line.epoch}>Achieved accuracy on training data: <span className={`${classes.bold} ${classes.fixedWidth}`}>{line.accuracy}%</span> after epoch: <span className={classes.bold}>{line.epoch}/{maxEpochs.current}</span></p>
                ))
            }
            {savedEpochRef.current < maxEpochs.current &&
                <ProgressBar percentage={percentage} />
            }
        </div>
    );
};

export default ProgressBox;