# Frontend for the Digit Recognition Web App
Frontend, built with React, for a digit recognition web app. It allows users to draw digits 
on a canvas and send the drawing to a backend server to predict what digit they drew using a pre-trained machine learning model.
Users can also try retraining the model themselves. The design for the page is original and the image components were made in Canva. Check out the live site at [digitrecognition](https://digitrecognition-ai.onrender.com), hosted on Render. The backend code can be viewed [here](https://github.com/krsalmi/ai_digits_backend.git).

## Notable components
**DrawingCanvas** is the main component in the project. It provides an interactive canvas for users to draw on
and includes functionality for sending the drawing to the backend for digit recognition,
as well as retraining the digit recognition model.
Before the drawing is sent to the server for digit recognition, it's preprocessed. This includes inverting colors, 
and downscaling, so that the image is as close as possible to the MNIST dataset, which the model is trained on.
  
The retraining of the model initiates an asynchronous request to the backend API and handles the API response. The progress of the training is 
displayed in **ProgressBox** and **ProgressBar**, showing the improving accuracy and progress percentage.

The **ButtonsComponent** renders the buttons for analyzing drawings, clearing the canvas, and retraining the model. Hovering on the buttons displays descriptions of the actions the buttons trigger.


## Run the frontend locally

### Prerequisites
Node.js and npm

### Installation
Clone the repo  
`git clone https://github.com/krsalmi/ai_digits_frontend.git`
  
Install client dependencies  
`npm install`
  
Start development server  
`npm start`
  
Open http://localhost:3000 to view the app in your browser.
