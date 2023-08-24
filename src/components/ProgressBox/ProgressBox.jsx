import React, { useState, useEffect, useRef } from "react";
import classes from './ProgressBox.module.css';
import { WAITING } from "../../utils/constants";
import { API_ENDPOINTS } from "../../utils/constants";
import LoadingDots from "../LoadingDots/LoadingDots";

const ProgressBox = ({progressLine = null, trainingOnGoing = false}) => {
    const [progressLines, setProgressLines] = useState(new Set());
    const stopWasClicked = useRef(false);
    const [cancellingTraining, setCancellingTraining] = useState(false);

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
        if (progressLine && progressLine.epoch && progressLine.accuracy) {
            if (!progressLines.length || progressLines[progressLines.length - 1].epoch !== progressLine.epoch) {
                //Using set here instead of arr to prevent duplicates
                setProgressLines(prev => [...prev, progressLine]);
            }
            
        }
    }, [progressLine]);

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
            {progressLines.length > 0 && 
                progressLines.map((line) => (
                    <p className={classes.progressRow} key={line.epoch}>Achieved accuracy on training data: <span className={`${classes.bold} ${classes.fixedWidth}`}>{line.accuracy}%</span> after epoch: <span className={classes.bold}>{line.epoch}</span></p>
                ))
            }
        </div>
    );
};

export default ProgressBox;