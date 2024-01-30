import React, { useState, useRef, useEffect }  from 'react';
import classes from './DrawingCanvas.module.css';
import { API_ENDPOINTS } from '../../utils/constants';
import ButtonsComponent from '../ButtonsComponent/ButtonsComponent';
import ProgressBox from '../Progress/ProgressBox';
import { MODEL_CREATION_STATUS, CANVAS_PROPERTIES } from '../../utils/constants';
import {createTempCanvas, invertCanvasColors, downscaleInSteps, clearCanvas, isCanvasEmpty } from '../../utils/canvasUtils';

/**
 * `DrawingCanvas` provides an interactive canvas for users to draw on.
 * It includes functionality for drawing, sending the drawing to a backend for digit recognition,
 * retraining the digit recognition model, and displaying model accuracy.
 * The component manages several states such as whether the user is currently drawing (`isDrawing`),
 * the status of training (`trainingStatus`), and flags to prevent multiple simultaneous send or retrain requests.
 *
 * It provides functions to handle different interactions:
 * - `startDrawing`, `endDrawing`, and `draw` for user drawing interactions.
 * - `sendDrawing` to send the canvas content to the backend for digit prediction.
 * - `retrainModel` to initiate the retraining of the digit recognition model.
 * - `displayModelAccuracy` to fetch and display the current model's accuracy.
 * - `endTraining` as a callback for when model training ends.
 */
const DrawingCanvas = ({startBannerAlert, handleOpenResultModal, handleOpenPredictionModal}) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const sendWasPressed = useRef(false);
    const retrainWasPressed = useRef(false);
    const [trainingStatus, setTrainingStatus] = useState(MODEL_CREATION_STATUS.NOT_STARTED);


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.fillStyle = CANVAS_PROPERTIES.CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, CANVAS_PROPERTIES.IMG_WIDTH, CANVAS_PROPERTIES.IMG_HEIGHT);
    }, []);

    const startDrawing = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.lineWidth = CANVAS_PROPERTIES.LINE_THICKNESS;
        ctx.lineCap = CANVAS_PROPERTIES.CANVAS_BRUSH_SHAPE;
        setIsDrawing(true);
        draw(event);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.beginPath();
    };

    const draw = (event) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const { clientX, clientY } = event;
        const { left, top } = canvas.getBoundingClientRect();

        ctx.lineTo(clientX - left, clientY - top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - left, clientY - top);
    };

    /**
     * Preprocesses the canvas by creating a temporary copy, inverting colors, 
     * and downscaling so that the image is as close as possible to images in MNIST dataset,
     * before sending to API for digit prediction.
     */
    const preliminaryPreprocessingCanvas = () => {
        const canvas = canvasRef.current;
        // Create a temporary canvas which will be altered and processed
        const tempCanvas = createTempCanvas(canvas);
        const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });
        invertCanvasColors(ctx);
        const pixelatedCanvas = downscaleInSteps(tempCanvas, 28, 3);
        return pixelatedCanvas;
    };

    /**
     * Sends the drawing on the canvas to the backend API for digit prediction.
     * Preprocesses the canvas first by inverting colors and downscaling before 
     * sending to API. Handles API response and displays prediction to user.
     */
    const sendDrawing = async () => {
        if (isCanvasEmpty(canvasRef.current)) {
            startBannerAlert("Cannot analyze an empty canvas.");
            return;
        }

        if (!sendWasPressed.current) {
            sendWasPressed.current = true;

            const preprocessedCanvas = preliminaryPreprocessingCanvas();
            const pixelatedData = preprocessedCanvas.toDataURL();

            try {
                const response = await fetch(API_ENDPOINTS.DRAWING, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ drawing: pixelatedData })
                });
                const result = await response.json();
                
                if (response.ok) {
                    const prediction = result?.prediction;
                    const confidence = (result?.confidence).toFixed(2);
                    console.log("Prediction: ", prediction, ", Confidence: ", confidence);
                    handleOpenPredictionModal(prediction, confidence);
                } else if (response.status === 503) {
                    console.log('Model file missing');
                    startBannerAlert("Model missing, please build a new one by clicking 'Train model'", "danger");
                } else {
                    console.log('Error sending drawing: ', result);
                    startBannerAlert("Error sending drawing!", "danger");
                }
            } catch (error) {
                console.log('Network error sending drawing: ', error);
                startBannerAlert("Network error sending drawing", "danger");
            }
            sendWasPressed.current = false;
        }
    };

    /**
     * Initiates asynchronous request to backend API to retrain the digit recognition model.
     * Handles API response and displays an alert to the user if an error has occured.
     * 
     */
    const retrainModel = async () => {
        if (!retrainWasPressed.current) {
            retrainWasPressed.current = true;

            try {
                const response = await fetch(API_ENDPOINTS.RETRAIN_MODEL, {
                    method: 'POST'
                });

                if (response.status === 202) { //202 accepted, model creation has started
                    console.log('Model creation has started')
                    setTrainingStatus(MODEL_CREATION_STATUS.IN_PROGRESS);
                } else if (response.status === 409) { //Conflict, retraining has already been triggered from somewhere else
                    console.log("Conflict, model is being trained");
                    startBannerAlert("Conflict! The model is being trained by someone else, please wait, and try again later.", "danger");
                    retrainWasPressed.current = false;
                } else {
                    console.log('Error trying to retrain model');
                    startBannerAlert("Error trying to retrain model", "danger");
                    retrainWasPressed.current = false;
                }
            } catch (error) {
                console.log('Network error sending "retrain" request: ', error);
                startBannerAlert("Network error sending 'Train' request", "danger");
                retrainWasPressed.current = false;
            }
        }
    };

    /**
     * Retrieves the current digit recognition model's accuracy percentage 
     * from the backend API and displays it in a modal dialog.
     */
    const displayModelAccuracy = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.MODEL_ACCURACY);
            const data = await response.json();

            if (data.accuracy !== undefined) {
                const accuracy = (data.accuracy * 100).toFixed(2);
                handleOpenResultModal(accuracy);
            }
        } catch (error) {
            console.log('Network error trying to fetch model accuracy. ', error);
            startBannerAlert("Failed to fetch model accuracy", "danger");
        }
    };

    /**
     * Callback function that is called when model training ends, 
     * either successfully or due to an error/interruption.
     * @param {string} reason - The reason the training ended - 
     * either 'completed', 'interrupted', or 'error'.
     */
    const endTraining = (reason) => {
        if (reason === MODEL_CREATION_STATUS.COMPLETED) {
            console.log("Model creation has successfully ended.");
            setTrainingStatus(MODEL_CREATION_STATUS.COMPLETED);
            displayModelAccuracy();
        } else if (reason === MODEL_CREATION_STATUS.INTERRUPTED){
            console.log("Model creation was interrupted.")
            setTrainingStatus(MODEL_CREATION_STATUS.INTERRUPTED);
            startBannerAlert("Model building and training was cancelled.");
        } else {
            console.log("Error while creating model.")
            setTrainingStatus(MODEL_CREATION_STATUS.ERROR);
            startBannerAlert("Error while creating model", "danger");
        }
        retrainWasPressed.current = false;
    }

    const disableTrain = retrainWasPressed.current;


    return (
        <div>
            <canvas
                ref={canvasRef}
                width={CANVAS_PROPERTIES.IMG_WIDTH}
                height={CANVAS_PROPERTIES.IMG_HEIGHT}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                className={classes.drawingCanvas}
            />
            <ButtonsComponent onClickButtonAnalyze={sendDrawing} onClickButtonClear={() => clearCanvas(canvasRef.current)} onClickButtonTrain={retrainModel} isTrainDisabled={disableTrain}/>
            {trainingStatus === MODEL_CREATION_STATUS.IN_PROGRESS &&
                <ProgressBox endTraining={endTraining}/>
            }
        </div>
    );
};

export default DrawingCanvas;
