const api = new DaydreamAPI();
let localStream = null;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const inputVideo = document.getElementById("inputVideo");
const outputVideo = document.getElementById("outputVideo");
const apiKeyInput = document.getElementById("apiKey");
const statusBadge = document.getElementById("statusBadge");
const streamIdValue = document.getElementById("streamIdValue");
const playbackLink = document.getElementById("playbackLink");
const pipelineValue = document.getElementById("pipelineValue");
const logList = document.getElementById("logList");

function setStatus(text, live = false) {
  statusBadge.textContent = text;
  statusBadge.classList.toggle("live", live);
}

function logEvent(message) {
  const entry = document.createElement("li");
  entry.className = "log-entry";
  const time = document.createElement("time");
  time.textContent = new Date().toLocaleTimeString();
  entry.appendChild(document.createTextNode(message));
  entry.appendChild(time);
  logList.prepend(entry);
  const maxEntries = 40;
  while (logList.children.length > maxEntries) {
    logList.removeChild(logList.lastChild);
  }
}

function resetDetails() {
  streamIdValue.textContent = "—";
  playbackLink.textContent = "Not available";
  playbackLink.removeAttribute("href");
  pipelineValue.textContent = api.defaultPipelineId || "Default (StreamDiffusion)";
}

async function startStream() {
  try {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert("Please provide a Daydream API key.");
      return;
    }

    setStatus("Preparing stream…", false);
    logEvent("Starting webcam capture");
    startBtn.disabled = true;
    stopBtn.disabled = false;

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    inputVideo.srcObject = localStream;

    api.setApiKey(apiKey);

    pipelineValue.textContent = api.defaultPipelineId || "Default (StreamDiffusion)";

    let streamInfo;
    try {
      streamInfo = await api.createStream();
    } catch (err) {
      if (err.message === "CORS_ERROR") {
        logEvent("CORS issue detected – retrying via proxy");
        api.enableCorsProxy();
        streamInfo = await api.createStream();
      } else {
        throw err;
      }
    }

    const { playbackId } = streamInfo;
    streamIdValue.textContent = streamInfo.streamId;
    const playbackUrl = `https://lvpr.tv/?v=${playbackId}&lowLatency=force`;
    playbackLink.textContent = playbackUrl;
    playbackLink.href = playbackUrl;
    outputVideo.src = playbackUrl;

    logEvent("Stream created – establishing WebRTC");
    setStatus("Live • streaming", true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 360;

    const drawFrame = () => {
      if (localStream && localStream.active) {
        ctx.drawImage(inputVideo, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      }
    };
    drawFrame();

    await api.setupWebRTC(canvas);
    logEvent("WebRTC handshake completed");
  } catch (error) {
    console.error(error);
    alert(error.message);
    logEvent(`Error: ${error.message}`);
    setStatus("Idle • awaiting API key", false);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
  }
}

async function stopStream() {
  try {
    if (api.streamId) {
      await api.deleteStream();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
    }
    outputVideo.src = "";
    resetDetails();
    setStatus("Idle • awaiting API key", false);
    logEvent("Stream stopped");
  } catch (error) {
    console.error(error);
    logEvent(`Failed to stop stream: ${error.message}`);
  } finally {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

startBtn.addEventListener("click", startStream);
stopBtn.addEventListener("click", stopStream);
resetDetails();
