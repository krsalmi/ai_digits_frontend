import { CANVAS_PROPERTIES } from "./constants";

/**
 * Creates a temporary canvas copy of the provided canvas.
 * This allows modifications to be made without affecting the original
 * and changes made won't be visible to the end user.
 */
export const createTempCanvas = (originalCanvas) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;

    // Get the context and draw the original canvas onto the temporary one
    const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(originalCanvas, 0, 0);
    return tempCanvas;
};

/**
 * Inverts the colors in the given canvas context. 
 * Changes colors from black to white and vice versa.
 */
export const invertCanvasColors = (canvasContext) => {
    const imageData = canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
    }

    canvasContext.putImageData(imageData, 0, 0);
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
export const downscaleInSteps = (sourceCanvas, targetSize, steps) =>{
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

export const clearCanvas = (canvas) => {
    const canvasContext = canvas.getContext("2d")
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = CANVAS_PROPERTIES.CANVAS_BG_COLOR;
    canvasContext.fillRect(0, 0, CANVAS_PROPERTIES.IMG_WIDTH, CANVAS_PROPERTIES.IMG_HEIGHT);
};

export const isCanvasEmpty = (canvas) => {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] !== 255 || imageData[i + 1] !== 255 || imageData[i + 2] !== 255 || imageData[i + 3] !== 255) {
            return false; // Not empty, non-white pixel was found
        }
    }
    return true; // Is empty
};