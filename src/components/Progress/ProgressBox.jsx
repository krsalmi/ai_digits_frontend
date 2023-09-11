import React, { useState, useEffect, useRef } from "react";
import classes from './Progress.module.css';
import { WAITING } from "../../utils/constants";
import { API_ENDPOINTS } from "../../utils/constants";
import LoadingDots from "../LoadingDots/LoadingDots";
import ProgressBar from "./ProgressBar";


const TIMEOUT_DURATION = 20000;  // 20 seconds timeout for waiting for SSE signals

const ProgressBox = ({endTraining}) => {
    const [accuracyLines, setAccuracyLines] = useState(new Set());
    const [percentage, setPercentage] = useState(0);
    const savedEpochRef = useRef(0);
    const maxEpochs = useRef(0);
    const [cancellingTraining, setCancellingTraining] = useState(false);
    const stopWasClicked = useRef(false);
    const timeoutRef = useRef(null);

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

        // Close connection and display error message if timeout occurs while waiting for
        // SSE signal. Usually this would result if out of memory etc
        const handleTimeout = () => {
            console.warn("SSE timeout occurred.");
            eventSource.close();
            endTraining("error");
        };

        timeoutRef.current = setTimeout(handleTimeout, TIMEOUT_DURATION);

        eventSource.onmessage = (event) => {
            // Signal received, so timeout can be cleared
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(handleTimeout, TIMEOUT_DURATION);

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

        const handleBeforeUnload = async (event) => {
            event.preventDefault();
    
            // Send stop training message to backend if page is left/reloaded. 
            // Use syncr. XMLHttpRequest because async operations might not complete during page unload
            const request = new XMLHttpRequest();
            request.open('GET', API_ENDPOINTS.STOP_TRAINING, false);
            request.send();
    
            // Some browsers might show a confirmation dialog for page unload, so display a custom message
            event.returnValue = 'Are you sure you want to leave? Training will be stopped.';
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            eventSource.close();  // Close connection if unmounted
            window.removeEventListener('beforeunload', handleBeforeUnload); // Cleanup listener
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