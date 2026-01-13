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
        if not success:
            break
        
        frame, is_focused = tracker.process_frame(frame)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/status')
def get_status():
    return jsonify({
        "is_focused": tracker.is_focused,
        "session_time": 0 # Placeholder
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)