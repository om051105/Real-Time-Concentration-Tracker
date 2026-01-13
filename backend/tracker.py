import cv2
import mediapipe as mp
import numpy as np
import time

class FocusTracker:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.focus_start_time = time.time()
        self.distracted_time = 0
        self.is_focused = True
        
    def calculate_iris_ratio(self, iris_landmarks, eye_landmarks):
        # Simplified gaze estimation logic
        # In a real rigorous implementation, this would involve PnP solver
        return 0.5 # Placeholder for stable gaze

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        h, w, _ = frame.shape
        
        status = "Distracted"
        color = (0, 0, 255)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            
            # Simple Logic: Check if face is centered
            nose_tip = landmarks[1]
            x, y = nose_tip.x, nose_tip.y
            
            if 0.35 < x < 0.65 and 0.35 < y < 0.65:
                status = "Focused"
                color = (0, 255, 0)
                self.is_focused = True
            else:
                self.is_focused = False

            # Draw landmarks
            cv2.circle(frame, (int(x * w), int(y * h)), 5, color, -1)
        else:
            self.is_focused = False
            status = "No Face"

        cv2.putText(frame, f"Status: {status}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        return frame, self.is_focused