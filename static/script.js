// improved, robust script.js
const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("status");
const statusBox = document.getElementById("status-box");

// debug helper
function logStatus(msg, level = "info") {
    const time = new Date().toLocaleTimeString();
    console[level](`[${time}] ${msg}`);
    if (statusText) statusText.innerText = msg;
}

// Check secure context
if (location.protocol !== "https:" && location.hostname !== "localhost") {
    logStatus("⚠️ Site not secure (HTTPS required for camera).", "warn");
}

// initialize mediapipe faceDetection
let faceDetection = new FaceDetection.FaceDetection({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
});
faceDetection.setOptions({
    model: 'short',
    minDetectionConfidence: 0.5
});

// results handler (same as before)
faceDetection.onResults(async (results) => {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!results || !results.detections || results.detections.length === 0) {
            // nothing detected
            return;
        }

        // use the first detection
        let det = results.detections[0];
        let box = det.boundingBox;

        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        let x = box.xCenter * videoWidth - (box.width * videoWidth) / 2;
        let y = box.yCenter * videoHeight - (box.height * videoHeight) / 2;
        let w = box.width * videoWidth;
        let h = box.height * videoHeight;

        // clamp values to canvas
        x = Math.max(0, x);
        y = Math.max(0, y);
        w = Math.min(videoWidth - x, w);
        h = Math.min(videoHeight - y, h);

        // draw futuristic box
        const resultColor = "#00ffcc"; // default
        ctx.strokeStyle = resultColor;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = resultColor;
        ctx.strokeRect(x, y, w, h);

        ctx.font = "20px Arial";
        ctx.fillStyle = resultColor;
        ctx.fillText("Detecting...", x + 6, y - 8);

        // crop face and send to server for prediction
        let tmp = document.createElement("canvas");
        tmp.width = Math.max(1, Math.round(w));
        tmp.height = Math.max(1, Math.round(h));
        let tctx = tmp.getContext("2d");
        tctx.drawImage(video, x, y, w, h, 0, 0, tmp.width, tmp.height);
        let faceData = tmp.toDataURL("image/jpeg");

        // POST to backend
        const resp = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: faceData })
        });

        if (!resp.ok) {
            logStatus(`Server returned ${resp.status}`, "error");
            return;
        }

        const data = await resp.json();
        const result = data.result || "N/A";
        const conf = ("confidence" in data) ? data.confidence : 0;
        const color = result === "Mask" ? "#00ffcc" : "#ff0066";

        // draw final box and confidence
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = color;
        ctx.strokeRect(x, y, w, h);

        ctx.font = "18px Arial";
        ctx.fillStyle = color;
        ctx.shadowBlur = 0;
        ctx.fillText(`${result} (${conf}%)`, x + 8, y - 10);

        // update status pill
        statusBox.style.background = result === "Mask" ? "#2ecc71" : "#e74c3c";
        logStatus(`${result} (${conf}%)`);

    } catch (err) {
        console.error("onResults error:", err);
        logStatus("Error processing results (see console)", "error");
    }
});

// Start camera with explicit getUserMedia to force permission prompt
async function startCameraAndDetection() {
    try {
        logStatus("Requesting camera permission...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;

        // ensure canvas sizes match actual video size when metadata loads
        video.addEventListener("loadedmetadata", () => {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            logStatus("Camera ready — starting detection loop...");
        });

        // Start a loop that feeds frames to mediapipe
        function frameLoop() {
            if (video.readyState >= 2) {
                try {
                    faceDetection.send({ image: video });
                } catch (e) {
                    console.error("faceDetection.send error:", e);
                }
            }
            requestAnimationFrame(frameLoop);
        }
        frameLoop();

    } catch (err) {
        console.error("getUserMedia error:", err);
        if (err && err.name === "NotAllowedError") {
            logStatus("Camera access denied — enable camera permission for this site.", "error");
        } else if (err && err.name === "NotFoundError") {
            logStatus("No camera found.", "error");
        } else {
            logStatus("Could not start camera — check console.", "error");
        }
    }
}

// run the startup
startCameraAndDetection();
