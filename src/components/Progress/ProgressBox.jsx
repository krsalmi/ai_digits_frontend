import React, { useState, useEffect, useRef } from "react";
import classes from './Progress.module.css';
import { WAITING } from "../../utils/constants";
import { API_ENDPOINTS } from "../../utils/constants";
import LoadingDots from "../LoadingDots/LoadingDots";
import ProgressBar from "./ProgressBar";


const TIMEOUT_DURATION = 5000;  // 50 seconds timeout for waiting for SSE signals

/**
 * The ProgressBox component renders a box showing training progress
 * and allows the user to end the training session via the endTraining callback.
 *
 * @param {Function} endTraining - Callback function to end model training.
*/
const ProgressBox = ({ endTraining }) => {
    const [accuracyLines, setAccuracyLines] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const savedEpochRef = useRef(0);
    const maxEpochs = useRef(0);
    const [cancellingTraining, setCancellingTraining] = useState(false);
    const stopWasClicked = useRef(false);
    const timeoutRef = useRef(null);

    const stopTraining = async () => {
        const response = await fetch(API_ENDPOINTS.STOP_TRAINING, {
            method: 'POST'
        });

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
            if (eventSource.readyState !== EventSource.CLOSED) {
                console.warn(`SSE timeout occurred for timeout ID: ${timeoutRef.current}`);
                eventSource.close();
                endTraining("error");
            }
            clearTimeout(timeoutRef.current);  // Clear the current timeout
        };

        timeoutRef.current = setTimeout(handleTimeout, TIMEOUT_DURATION);

        eventSource.onopen = () => {
            console.log("SSE connection opened");
        };

        /**
         * Handles incoming messages from the server-sent events stream.
         * Updates component state based on received data.
         */
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
                clearTimeout(timeoutRef.current);
                // Handle close event
                console.log(`Connection closed due to: ${data.reason}`);
                eventSource.close();
                endTraining(data.reason);
            }
        };

        /**
         * Handles errors from the server-sent events stream.
         * Closes the connection and ends training on error.
         */
        eventSource.onerror = (event) => {
            console.error("SSE Error received:", event);
            if (event.target.readyState === EventSource.CLOSED) {
                console.log('SSE closed');
            } else {
                eventSource.close();
                endTraining("error");
            }
        };


        /**
         * stopTrainingOnExit is an event listener that runs when the beforeunload event fires, 
         * indicating the user is leaving/refreshing the page. It sends a request to the server
         * to stop the training job.
         * The sendBeacon method returns true if the user agent is able to successfully queue the data for transfer, Otherwise it returns false.
         */
        const stopTrainingOnExit = (event) => {
            
            const beaconStatus = navigator.sendBeacon(API_ENDPOINTS.STOP_TRAINING);
            if (!beaconStatus) {
                console.warn("Beacon request failed. Training may not stop on server.");
            }
        };
        
        window.addEventListener('beforeunload', stopTrainingOnExit);

        return () => {
            eventSource.close();  // Close connection if unmounted
            window.removeEventListener('beforeunload', stopTrainingOnExit); // Cleanup listener
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
            <div className={classes.trainingLines}>
            {accuracyLines.length > 0 && 
                accuracyLines.map((line) => (
                    <p className={classes.progressRow} key={line.epoch}>Achieved accuracy on training data: <span className={`${classes.bold} ${classes.fixedWidth}`}>{line.accuracy}%</span> after epoch: <span className={classes.bold}>{line.epoch}/{maxEpochs.current}</span></p>
                ))
            }
            </div>


            {accuracyLines.length > 0 && 
                accuracyLines.map((line) => (
                    <p className={classes.progressRow} key={line.epoch}>Achieved accuracy on training data: 
                        <span className={`${classes.bold} ${classes.fixedWidth}`}>{line.accuracy}%</span>
                         after epoch: <span className={classes.bold}>{line.epoch}/{maxEpochs.current}</span></p>
                ))
            }
            { process.env.NODE_ENV === "production" && accuracyLines.length === 0 &&
                <p>{process.env.REACT_APP_TRAINING_INFO}</p>
            }
            {savedEpochRef.current < maxEpochs.current &&
                <ProgressBar percentage={percentage} />
            }
        </div>
    );
};

export default ProgressBox;