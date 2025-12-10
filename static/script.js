const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("status");
const statusBox = document.getElementById("status-box");

let faceDetection = new FaceDetection.FaceDetection({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});
faceDetection.setOptions({
    model: 'short',
    minDetectionConfidence: 0.5
});

let camera = new Camera(video, {
    onFrame: async () => {
        await faceDetection.send({ image: video });
    },
    width: 640,
    height: 480
});
camera.start();

function drawBox(x, y, w, h, color, text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeRect(x, y, w, h);

    ctx.font = "20px Arial";
    ctx.fillStyle = color;
    ctx.shadowBlur = 0;
    ctx.fillText(text, x, y - 10);
}

faceDetection.onResults(async (results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.detections || results.detections.length === 0)
        return;

    let det = results.detections[0];
    let box = det.boundingBox;

    let x = box.xCenter * 640 - (box.width * 640) / 2;
    let y = box.yCenter * 480 - (box.height * 480) / 2;
    let w = box.width * 640;
    let h = box.height * 480;

    // Crop face area
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    let tctx = tempCanvas.getContext("2d");
    tctx.drawImage(video, x, y, w, h, 0, 0, w, h);

    let faceImage = tempCanvas.toDataURL("image/jpeg");

    // Send to backend
    let res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: faceImage })
    });

    let data = await res.json();

    let result = data.result;
    let conf = data.confidence;
    let color = result === "Mask" ? "#00ffcc" : "#ff0066";

    statusText.innerHTML = `${result} (${conf}%)`;
    statusBox.style.background = result === "Mask" ? "#2ecc71" : "#e74c3c";

    drawBox(x, y, w, h, color, `${conf}%`);
});
