const video = document.getElementById("video");
const statusText = document.getElementById("status");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

function sendFrame() {
  if (video.videoWidth === 0) {
    return setTimeout(sendFrame, 300);
  }

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
  .then(data => statusText.innerText = data.result);

  setTimeout(sendFrame, 500);
}

video.addEventListener("playing", sendFrame);
