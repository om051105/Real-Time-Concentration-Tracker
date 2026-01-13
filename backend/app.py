from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from tracker import FocusTracker

app = Flask(__name__)
CORS(app)
tracker = FocusTracker()
camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success: break
        frame, _ = tracker.process_frame(frame)
        ret, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(port=5000)