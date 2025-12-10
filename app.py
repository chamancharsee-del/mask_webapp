from flask import Flask, render_template, request, jsonify
import numpy as np
import cv2
import onnxruntime as ort
import base64

app = Flask(__name__)

# Load ONNX model
session = ort.InferenceSession("mask_detector.onnx")
input_name = session.get_inputs()[0].name


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["image"]

    img_bytes = base64.b64decode(data.split(",")[1])
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    face = cv2.resize(frame, (224, 224))
    face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    face = face.astype("float32") / 255.0
    face = np.expand_dims(face, axis=0)

    preds = session.run(None, {input_name: face})[0][0]
    (mask, withoutMask) = preds

    label = "Mask" if mask > withoutMask else "No Mask"

    return jsonify({"result": label})


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
