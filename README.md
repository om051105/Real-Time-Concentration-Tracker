#  FocusAI (Real-Time Concentration Tracker)

<div align='center'>

![Build Status](https://img.shields.io/github/actions/workflow/status/om051105/Real-Time-Concentration-Tracker/main.yml?label=build&style=flat-square)
![License](https://img.shields.io/github/license/om051105/Real-Time-Concentration-Tracker?style=flat-square)
![Issues](https://img.shields.io/github/issues/om051105/Real-Time-Concentration-Tracker?style=flat-square)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fom051105%2FReal-Time-Concentration-Tracker)

</div>

##  Overview
**FocusAI** is a sophisticated computer vision system designed to analyze and improve user productivity in real-time. By leveraging **Deep Learning** models for gaze tracking and facial landmark detection, it provides granular insights into attention spans.

## 🚀 Key Features
*   **👀 Gaze & Head Pose Estimation**: Uses advanced geometric algorithms.
*   **📉 Real-Time Distraction Alerts**: Gentle notifications when focus drifts.
*   ** Productivity Dashboard**: React-based frontend visualizing focus trends.
*   ** Privacy First**: All video processing happens locally.

##  Tech Stack
*   **AI Engine**: TensorFlow / MediaPipe Face Mesh
*   **Processing**: Python (OpenCV)
*   **Frontend**: React.js, Chart.js

##  Installation
\\\ash
git clone https://github.com/om051105/Real-Time-Concentration-Tracker.git
cd Real-Time-Concentration-Tracker
pip install -r backend/requirements.txt
python backend/app.py
\\\
"@

 = @"
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}