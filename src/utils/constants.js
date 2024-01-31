// API endpoints

const BASE = process.env.REACT_APP_BASE_URL;

export const API_ENDPOINTS = {
    DRAWING: BASE + '/api/drawing/',
    CHECK_MODEL_STATUS: BASE + '/api/check_model_status/', //was used together with TRAINING_PROGRESS, currently not used
    RETRAIN_MODEL: BASE + '/api/retrain_model/',
    TRAINING_PROGRESS: BASE + '/api/training_progress/', //was used when training progress was done through polling, now use PROGRESS_SSE
    STOP_TRAINING: BASE + '/api/stop_training/',
    MODEL_ACCURACY: BASE + '/api/model_accuracy/',
    PROGRESS_SSE: BASE + '/api/progress/'
};

export const HOVER_TEXTS = {
    ANALYZE_DRAWING: `Clicking 'Analyze Drawing' sends the canvas drawing for analysis by the trained model. \
                    The predicted digit will be displayed on-screen. Digits drawn in the middle of the canvas will perform better.`,
    CLEAR_CANVAS: "Clicking the 'Clear Canvas' button clears the canvas and deletes anything currently in the drawing box.",
    TRAIN_MODEL: `Clicking the 'Train Model' button begins the process of rebuilding and training a Convolutional Neural Network and \
        and displays the achieved precision. The entire process takes about 8 minutes, with progress updates displayed on-screen.`
};

export const CNN_DESCRIPTION = {
    TITLE: "Details of the digit recognition system",
    TEXT_1: `The foundation of this digit recognizer is a Convolutional Neural Network (CNN) built using TensorFlow's Keras library. \
        At its core, the network contains two convolutional \
        layers for extracting key features from handwritten digits and two max-pooling layers for dimensionality reduction. \
        The CNN also contains a hidden layer with 128 nodes and a special dropout layer to mitigate overfitting risks. \
        The final classification happens in the output layer, which provides the probability of the input image belonging to each of the 10 classes. `,
    TEXT_2: ` All training data \
        comes from the popular MNIST dataset, with images first being normalized and reshaped. An adaptive learning rate is implemented for a smoother training experience. \
        Once training concludes, the model undergoes testing and the accuracy it achieves is displayed on-screen.`
};

export const WAITING = {
    TRAINING: "Training in progress",
    EPOCH: "Waiting for information on each training cycle (epoch)...",
    CANCEL: "Cancelling training"
};

export const MODEL_CREATION_STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    INTERRUPTED: "interrupted",
    ERROR: "error"
};

export const CANVAS_PROPERTIES = {
    IMG_HEIGHT: 280,
    IMG_WIDTH: 280,
    LINE_THICKNESS: 25,
    CANVAS_BG_COLOR: "#FFFFFF",
    CANVAS_BRUSH_SHAPE: "round"
};