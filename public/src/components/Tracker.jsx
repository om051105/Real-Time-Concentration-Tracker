import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

const Tracker = ({ onUpdate }) => {
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const lastRunRef = useRef(0);
    const isDetectingRef = useRef(false);

    // Models
    const objNet = useRef(null);
    const faceNet = useRef(null);

    // Load models
    useEffect(() => {
        const loadModels = async () => {
            try {
                await tf.setBackend('webgl');

                // Load Object Detector (Phone)
                objNet.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' }); // Use lighter model if possible

                // Load Face Detector (Attention)
                const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                const detectorConfig = {
                    runtime: 'tfjs',
                    refineLandmarks: false, // Turn off refine for speed
                    maxFaces: 1
                };
                faceNet.current = await faceLandmarksDetection.createDetector(model, detectorConfig);

                setLoading(false);
            } catch (err) {
                console.error("Error loading models:", err);
                setLoading(false);
            }
        };
        loadModels();
    }, []);

    const detect = useCallback(async () => {
        // Prevent overlapping runs and limit frame rate (Throttling)
        const now = Date.now();
        if (isDetectingRef.current || now - lastRunRef.current < 200) { // Max 5 detections/sec
            return;
        }

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            objNet.current &&
            faceNet.current
        ) {
            isDetectingRef.current = true;
            lastRunRef.current = now;

            try {
                const video = webcamRef.current.video;

                // CRITICAL: Ensure video element sizing matches the stream for TFJS
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    if (video.width !== video.videoWidth || video.height !== video.videoHeight) {
                        video.width = video.videoWidth;
                        video.height = video.videoHeight;
                    }
                } else {
                    // Loop again if video not ready
                    return;
                }

                let status = "FOCUSED";
                let details = [];

                // Run detections in parallel? No, js is single threaded mostly for this, but await helps
                // 1. Object Detection (Phone)
                const objPredictions = await objNet.current.detect(video);
                const phone = objPredictions.find(p => p.class === 'cell phone');

                if (phone) {
                    status = "DISTRACTED";
                    details.push("Phone Detected");
                }

                // 2. Face Detection (Attention)
                const faces = await faceNet.current.estimateFaces(video);

                if (faces.length === 0) {
                    if (status === "FOCUSED") details.push("User Absent");
                    if (status === "FOCUSED") status = "DISTRACTED";
                } else {
                    const face = faces[0];
                    const keypoints = face.keypoints;

                    // Simple logic for speed
                    const nose = keypoints[1];
                    const leftEye = keypoints[33];
                    const rightEye = keypoints[263];

                    if (nose && leftEye && rightEye) {
                        const distLeft = Math.abs(nose.x - leftEye.x);
                        const distRight = Math.abs(nose.x - rightEye.x);
                        const ratio = distLeft / (distRight + 0.001);

                        if (ratio < 0.25 || ratio > 4.0) {
                            if (status === "FOCUSED") {
                                status = "DISTRACTED";
                                details.push("Looking Away");
                            }
                        }
                    }
                }

                onUpdate({ status, details });
            } catch (e) {
                console.error("Detection Error", e);
            } finally {
                isDetectingRef.current = false;
            }
        }
    }, [onUpdate]);

    // Use setInterval instead of RequestAnimationFrame to decouple rendering from AI
    useEffect(() => {
        if (!loading) {
            const intervalId = setInterval(detect, 100); // Trigger check often, but throttle handles actual run
            return () => clearInterval(intervalId);
        }
    }, [loading, detect]);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
                    <div className="text-[var(--accent-primary)] animate-pulse">Loading High-Speed Models...</div>
                </div>
            )}
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
            />
            {/* Overlay for cinematic look */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent z-10"></div>
        </div>
    );
};

export default Tracker;
