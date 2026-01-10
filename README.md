# FocusFlow | Real-Time Concentration Tracker

FocusFlow is a premium, AI-powered web application that monitors your concentration levels in real-time using your webcam. It detects distractions such as phone usage or looking away from the screen and provides immediate feedback.

## Features
-   **Real-Time AI Detection**: Uses TensorFlow.js to run `Coco-SSD` (Object Detection) and `FaceMesh` (Head Pose) directly in your browser.
-   **Privacy First**: No video data is sent to any server. All processing happens locally on your device.
-   **Concentration Score**: A dynamic score that drops when distracted and recovers when you focus.
-   **Phone Detection**: Automatically alerts you if a mobile phone is detected in the frame.
-   **Modern Dashboard**: A sleek, dark-mode interface with glassmorphism effects.

## How to Run

1.  Open a terminal in this directory.
2.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the link provided (usually `http://localhost:5173`) in your browser.
5.  **Allow Camera Access**: You must allow the browser to access your webcam for the tracker to work.

## Technology Stack
-   **React + Vite**: Fast frontend framework.
-   **TensorFlow.js**: Client-side Machine Learning.
-   **Tailwind-style CSS**: Custom Vanilla CSS using modern variables.
-   **Lucide React**: Icons.
