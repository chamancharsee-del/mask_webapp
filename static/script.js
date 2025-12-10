const video = document.getElementById("video");
const statusText = document.getElementById("status");
const statusBox = document.getElementById("status-box");

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        statusText.innerHTML = "Camera Active";
    })
    .catch(err => {
        statusText.innerHTML = "Camera Blocked";
        console.error(err);
    });

let lastStatus = "";

// Capture frame every 500ms
setInterval(() => {
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    let dataURL = canvas.toDataURL("image/jpeg");

    fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL })
    })
    .then(r => r.json())
    .then(data => {
        let result = data.result;
        statusText.innerHTML = result;

        if (result !== lastStatus) {
            if (result === "Mask") {
                statusBox.style.background = "#2ecc71"; // green
            } else {
                statusBox.style.background = "#e74c3c"; // red
            }
            lastStatus = result;
        }
    });

}, 500);
