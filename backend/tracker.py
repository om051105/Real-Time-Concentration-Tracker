import cv2
import mediapipe as mp
import time

class FocusTracker:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        self.is_focused = True

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        h, w, _ = frame.shape
        status = "Distracted"
        color = (0, 0, 255)

        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            nose = landmarks[1]
            if 0.4 < nose.x < 0.6 and 0.4 < nose.y < 0.6:
                status = "Focused"
                color = (0, 255, 0)
                self.is_focused = True
            else:
                self.is_focused = False
            
            cv2.circle(frame, (int(nose.x * w), int(nose.y * h)), 5, color, -1)
        
        cv2.putText(frame, f"Status: {status}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        return frame, self.is_focused