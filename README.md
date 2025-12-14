Real-Time AI Mask Detection (ONNX + Flask + Mediapipe)
(NSEC minor Project):

A futuristic, real-time mask detection web app built using:

ONNX Runtime – fast, portable AI inference

MediaPipe Face Detection (client-side) – smooth, low-latency face tracking

Flask – lightweight backend API

JavaScript + Canvas – neon futuristic UI and overlays

WebRTC – browser webcam access

Runs locally or fully deployable on platforms like Render.

✨ Features
🔹 Real-time mask detection

Uses your webcam and performs predictions at high speed.

🔹 Browser-side face detection (no backend webcam required)

MediaPipe detects faces directly in your browser → only cropped face is sent to server → fast & private.

🔹 ONNX model for mask detection

Deep learning model converted to ONNX for fast inference.

🔹 Futuristic neon UI

Glowing HUD-style bounding box
Confidence percentage
Smooth animations

🔹 100% Deployable

Works on hosting platforms with no physical webcam, since detection is done in the browser.

🖥️ Demo Preview

Live webcam feed

Neon glowing bounding box around your face

Mask / No Mask prediction

Confidence percentage: 

<img width="640" height="480" alt="plot" src="https://github.com/user-attachments/assets/a4ed9fd4-7c89-4f89-8f58-e0b6ccf39456" />
<img width="2400" height="1600" alt="mask_detection_training" src="https://github.com/user-attachments/assets/5fada653-1e47-46da-bd05-5cf99dee4719" />

📁 Project Structure
📦 your-project/
│
├── app.py                   # Flask backend
├── mask_detector.onnx       # ONNX mask detection model
│
├── templates/
│   └── index.html           # Frontend UI
│
├── static/
│   └── script.js            # Webcam + face detection + overlay
│
├── requirements.txt         # Dependencies for deployment
└── README.md                # This file

🔧 Installation & Usage
1️⃣ Clone the repository
git clone https://github.com/chamancharsee-del/mask_webapp.git
cd mask_webapp.git

2️⃣ Install dependencies
pip install -r requirements.txt

3️⃣ Run the Flask server
python app.py

Your webcam will start automatically.

⚙️ Requirements

These are included in requirements.txt, but listed here for reference:

flask
opencv-python-headless
numpy
onnxruntime


MediaPipe is loaded through CDN (no install needed).

🧠 How It Works
1. Browser handles face detection

Mediapipe detects faces in real time (very fast & lightweight).

2. Face region is cropped and sent to Flask

Only relevant data is transmitted → efficient and secure.

3. Flask runs ONNX model prediction

Model outputs two values:

Mask

No Mask

4. UI displays futuristic overlay

Using <canvas> to draw:

neon borders

glowing effects

confidence percentages

🌐 Deploying on Render

Push code to GitHub

Create a new Web Service on Render

Set Build Command:

pip install -r requirements.txt


Set Start Command:

gunicorn app:app


(Recommended) Click "Clear Build Cache and Deploy" if issues occur

No webcam required on server — works flawlessly.

🛠️ Troubleshooting
❗ Camera not starting?

Allow browser webcam permissions.

❗ Black screen?

HTTPS is required for webcam on deployed version.

❗ Delay or lag?

Try closing heavy browser tabs.

 Credits:

MediaPipe by Google

ONNX Runtime

Flask Framework

Custom deep learning model for mask detection
