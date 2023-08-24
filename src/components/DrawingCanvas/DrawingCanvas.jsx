import React, { useState, useRef, useEffect }  from 'react';
import classes from './DrawingCanvas.module.css';
import { API_ENDPOINTS } from '../../utils/constants';
import ButtonsComponent from '../ButtonsComponent/ButtonsComponent';
import ProgressBox from '../ProgressBox/ProgressBox';

const IMG_HEIGHT = 280;
const IMG_WIDTH = 280;
const LINE_THICKNESS = 25;
const POLL_INTERVAL = 5000; //Poll every 5 sec
const MODEL_CREATION_STATUS = ["not_started", "in_progress", "completed", "interrupted"];
const CANVAS_BG_COLOR = "#FFFFFF";
const CANVAS_BRUSH_SHAPE = "round";


const DrawingCanvas = ({startBannerAlert, handleOpenResultModal, handleOpenPredictionModal}) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const sendWasPressed = useRef(false);
    const retrainWasPressed = useRef(false);
    const [trainingStatus, setTrainingStatus] = useState(MODEL_CREATION_STATUS[0]);
    const [progressLine, setProgressLine] = useState({});

    let poller = null;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }, []);
    
    useEffect(() => {
        if(trainingStatus === MODEL_CREATION_STATUS[2]) {
            displayModelAccuracy();
        }
    }, [trainingStatus]);

    const startDrawing = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = LINE_THICKNESS;
        ctx.lineCap = CANVAS_BRUSH_SHAPE;
        setIsDrawing(true);
        draw(event);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
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
        ctx.fillStyle = CANVAS_BG_COLOR;
        ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    };

    // Shrinks the canvas to 28x28, which is size of images in MNIST dataset
    // Downscaling is done in steps so that edges aren't too harsh and some grey will be present
    // Downscaling causes a "pixelated" look
    function downscaleInSteps(sourceCanvas, targetSize, steps) {
        let width = sourceCanvas.width;
        let height = sourceCanvas.height;
    
        let currentCanvas = sourceCanvas;
        for (let i = 0; i < steps; i++) {
            const nextCanvas = document.createElement('canvas');
            width = Math.floor(width / 2);
            height = Math.floor(height / 2);
            
            nextCanvas.width = width;
            nextCanvas.height = height;
    
            const ctx = nextCanvas.getContext('2d');
            ctx.drawImage(currentCanvas, 0, 0, width, height);
    
            currentCanvas = nextCanvas;
        }
    
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetSize;
        finalCanvas.height = targetSize;
        const ctxFinal = finalCanvas.getContext('2d');
        ctxFinal.drawImage(currentCanvas, 0, 0, targetSize, targetSize);
    
        return finalCanvas;
    };

    // Inverts colors (black to white, white to black) to be more consistent with the data in MNIST
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

    // Creates a temporary canvas, so changes made won't be visible to the end user
    const createTempCanvas = (originalCanvas) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
    
        // Get the context and draw the original canvas onto the temporary one
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(originalCanvas, 0, 0);
        return tempCanvas;
    };

    // Preprocess canvas: create a temp canvas, invert its colors, and downscale it
    // so that the image is as close as possible to images in MNIST dataset
    const preliminaryPreprocessingCanvas = () => {
        const canvas = canvasRef.current;
        // Create a temporary canvas which will be altered and processed
        const tempCanvas = createTempCanvas(canvas);
        const ctx = tempCanvas.getContext("2d");
        invertColors(ctx);
        const pixelatedCanvas = downscaleInSteps(tempCanvas, 28, 3);
        return pixelatedCanvas;
    };

    const sendDrawing = async () => {
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

    const retrainModel = async () => {
        if (!retrainWasPressed.current) {
            retrainWasPressed.current = true;

            try {
                const response = await fetch(API_ENDPOINTS.RETRAIN_MODEL);

                if (response.status === 202) { //202 accepted, model creation has started
                    console.log('Model creation has started')
                    setTrainingStatus(MODEL_CREATION_STATUS[1]);
                    setProgressLine({});
                    startPolling();
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

    const fetchTrainingProgress = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.TRAINING_PROGRESS);
            const data = await response.json();
    
            if (data.epoch !== undefined) {
                const accuracy = (data.accuracy * 100).toFixed(2);
                setProgressLine({epoch: data.epoch, accuracy: accuracy});
            }
        } catch (error) {
            console.log('Network error trying to fetch training progress. ', error);
        }
    };

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
        }
    };

    const startPolling = async () => {

        poller = setInterval(async () => {
            try {
                const response = await fetch(API_ENDPOINTS.CHECK_MODEL_STATUS);
                const data = await response.json();

                if (!response.ok) {
                    console.log(`Unexpected status code: ${response.status}`);
                    clearInterval(poller);
                } else {
                    if (data?.model_status === MODEL_CREATION_STATUS[1]) {
                        setTrainingStatus(MODEL_CREATION_STATUS[1]);
                    } else {
                        if (data?.model_status === MODEL_CREATION_STATUS[2]) {
                            console.log("Model creation has successfully ended.");
                            setTrainingStatus(MODEL_CREATION_STATUS[2]);
                        } else if (data?.model_status === MODEL_CREATION_STATUS[3]) {
                            console.log("Model creation was interrupted.")
                            setTrainingStatus(MODEL_CREATION_STATUS[3]);
                            startBannerAlert("Model building and training was cancelled.");
                        }
                        clearInterval(poller);
                        retrainWasPressed.current = false;
                        
                    }
                }
                fetchTrainingProgress();

            } catch (error) {
                clearInterval(poller);
                console.log("Error while polling ", error);
            }
        }, POLL_INTERVAL)
    };

    const disableButtons = (retrainWasPressed.current || sendWasPressed.current);


    return (
        <div>
            <canvas
                ref={canvasRef}
                width={IMG_WIDTH}
                height={IMG_HEIGHT}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseMove={draw}
                className={classes.drawingCanvas}
            />
            <ButtonsComponent onClickButton1={sendDrawing} onClickButton2={clearCanvas} onClickButton3={retrainModel} disabled={disableButtons}/>
            {trainingStatus === MODEL_CREATION_STATUS[1] &&
                <ProgressBox progressLine={progressLine} />
            }
        </div>
    );
};

export default DrawingCanvas;
