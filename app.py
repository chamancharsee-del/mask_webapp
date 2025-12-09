from flask import Flask, render_template, Response
import cv2
import numpy as np
import imutils
import onnxruntime as ort

app = Flask(__name__)

# Load ONNX model
session = ort.InferenceSession("mask_detector.onnx")
input_name = session.get_inputs()[0].name

# Load face detector
prototxtPath = "face_detector/deploy.prototxt"
weightsPath = "face_detector/res10_300x300_ssd_iter_140000.caffemodel"
faceNet = cv2.dnn.readNet(prototxtPath, weightsPath)


def generate_frames():
    cap = cv2.VideoCapture(0)   # webcam

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = imutils.resize(frame, width=600)
        (h, w) = frame.shape[:2]

        # Prepare face detector blob
        blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300),
                                     (104.0, 177.0, 123.0))
        faceNet.setInput(blob)
        detections = faceNet.forward()

        # Loop over detections
        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")

                startX = max(0, startX)
                startY = max(0, startY)
                endX = min(w - 1, endX)
                endY = min(h - 1, endY)

                face = frame[startY:endY, startX:endX]
                if face.size >
