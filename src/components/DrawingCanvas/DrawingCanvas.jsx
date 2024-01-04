import React, { useState, useRef, useEffect }  from 'react';
import classes from './DrawingCanvas.module.css';
import { API_ENDPOINTS } from '../../utils/constants';
import ButtonsComponent from '../ButtonsComponent/ButtonsComponent';
import ProgressBox from '../Progress/ProgressBox';
import { MODEL_CREATION_STATUS, CANVAS_PROPERTIES } from '../../utils/constants';

/**
 * DrawingCanvas component renders a canvas element that allows 
 * the user to draw digits with mouse or touch events. It handles
 * the canvas rendering context, tracks drawing state, and exposes 
 * methods to clear the canvas, start/stop drawing, and send drawings
 * to the backend API for classification.
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

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = CANVAS_PROPERTIES.CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, CANVAS_PROPERTIES.IMG_WIDTH, CANVAS_PROPERTIES.IMG_HEIGHT);
    };

    const isCanvasEmpty = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i] !== 255 || imageData[i + 1] !== 255 || imageData[i + 2] !== 255 || imageData[i + 3] !== 255) {
                return false; // Not empty, non-white pixel was found
            }
        }
        return true; // Is empty
    };

    /**
     * Shrinks the canvas to 28x28, which is size of images in MNIST dataset.
     * Downscaling is done in steps so that edges aren't too harsh and some grey will be present.
     * Downscaling causes a "pixelated" look.
     * 
     * @param {HTMLCanvasElement} sourceCanvas - The canvas to downscale.
     * @param {number} targetSize - The target width and height to downscale to.
     * @param {number} steps - The number of downscaling steps to take. More steps result in a smoother downscaled image.
     */
    const downscaleInSteps = (sourceCanvas, targetSize, steps) =>{
        let width = sourceCanvas.width;
        let height = sourceCanvas.height;
    
        let currentCanvas = sourceCanvas;
        for (let i = 0; i < steps; i++) {
            const nextCanvas = document.createElement('canvas');
            width = Math.floor(width / 2);
            height = Math.floor(height / 2);
            
            nextCanvas.width = width;
            nextCanvas.height = height;
    
            const ctx = nextCanvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(currentCanvas, 0, 0, width, height);
    
            currentCanvas = nextCanvas;
        }
    
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetSize;
        finalCanvas.height = targetSize;
        const ctxFinal = finalCanvas.getContext("2d", { willReadFrequently: true });
        ctxFinal.drawImage(currentCanvas, 0, 0, targetSize, targetSize);
    
        return finalCanvas;
    };

    /**
     * Inverts the colors in the given canvas context. 
     * Changes colors from black to white and vice versa.
     */
    const invertColors = (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
    
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
        }
    
        ctx.putImageData(imageData, 0, 0);
    };

    /**
     * Creates a temporary canvas copy of the provided canvas.
     * This allows modifications to be made without affecting the original
     * and changes made won't be visible to the end user.
     */
    const createTempCanvas = (originalCanvas) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
    
        // Get the context and draw the original canvas onto the temporary one
        const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(originalCanvas, 0, 0);
        return tempCanvas;
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
        invertColors(ctx);
        const pixelatedCanvas = downscaleInSteps(tempCanvas, 28, 3);
        return pixelatedCanvas;
    };

    /**
     * Sends the drawing on the canvas to the backend API for digit prediction.
     * Preprocesses the canvas first by inverting colors and downscaling before 
     * sending to API. Handles API response and displays prediction to user.
     */
    const sendDrawing = async () => {
        if (isCanvasEmpty()) {
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
            <ButtonsComponent onClickButtonAnalyze={sendDrawing} onClickButtonClear={clearCanvas} onClickButtonTrain={retrainModel} isTrainDisabled={disableTrain}/>
            {trainingStatus === MODEL_CREATION_STATUS.IN_PROGRESS &&
                <ProgressBox endTraining={endTraining}/>
            }
        </div>
    );
};

export default DrawingCanvas;
