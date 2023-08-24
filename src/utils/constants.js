// API endpoints

const BASE = process.env.REACT_APP_BACKEND_URL;

export const API_ENDPOINTS = {
    DRAWING: BASE + '/api/drawing/',
    CHECK_MODEL_STATUS: BASE + '/api/check_model_status/',
    RETRAIN_MODEL: BASE + '/api/retrain_model/',
    TRAINING_PROGRESS: BASE + '/api/training_progress/',
    STOP_TRAINING: BASE + '/api/stop_training/',
    MODEL_ACCURACY: BASE + '/api/model_accuracy/'
};

export const HOVER_TEXTS = {
    ANALYZE_DRAWING: "Clicking 'Analyze Drawing' sends the canvas drawing for analysis by the trained model. The predicted digit will be displayed on-screen.",
    CLEAR_CANVAS: "Clicking the 'Clear Canvas' button clears the canvas and deletes anything currently in the drawing box.",
    TRAIN_MODEL: `Clicking the 'Train Model' button begins the process of rebuilding and training a Convolutional Neural Network and \
        saving the model to be used after training. The entire process takes about 5 minutes, with progress updates displayed on-screen.`
};

export const CNN_DESCRIPTION = {
    TITLE: "Details of the digit recognition system",
    TEXT_1: `The foundation of this digit recognizer is a Convolutional Neural Network (CNN) built using TensorFlow's Keras library. \
        At its core, the network contains two convolutional \
        layers for extracting key features from handwritten digits and two max-pooling layers for dimensionality reduction. The final classification \
        happens in a dense layer packed with 128 neurons, and a special dropout layer is added to the mix to mitigate overfitting risks.`,
    TEXT_2: ` All training data \
        comes from the popular MNIST dataset, with images first being normalized and reshaped. An adaptive learning rate is implemented for a smoother training experience. \
        Once training concludes, the model undergoes testing and is saved for subsequent operations.`
};

export const WAITING = {
    TRAINING: "Training in progress",
    EPOCH: "Waiting for information on each training cycle (epoch)...",
    CANCEL: "Cancelling training"
};