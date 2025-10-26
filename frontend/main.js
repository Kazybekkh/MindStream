const api = new DaydreamAPI();
let localStream = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const inputVideo = document.getElementById('inputVideo');
const outputVideo = document.getElementById('outputVideo');
const apiKeyInput = document.getElementById('apiKey');

async function startStream() {
    try {
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // 1️⃣ Capture camera
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    inputVideo.srcObject = localStream;

    // 2️⃣ Set Daydream API key
    api.setApiKey(apiKeyInput.value.trim());

    // 3️⃣ Create stream — retry with CORS proxy if needed
    let streamInfo;
    try {
        streamInfo = await api.createStream();
    } catch (err) {
        if (err.message === 'CORS_ERROR') {
        console.warn('🌐 Detected CORS issue — enabling proxy and retrying...');
        api.enableCorsProxy();
        streamInfo = await api.createStream();
        } else {
        throw err;
        }
    }

    const { whipUrl, playbackId } = streamInfo;
    console.log('✅ Stream created', streamInfo);

    // 4️⃣ Show processed output
    outputVideo.src = `https://lvpr.tv/?v=${playbackId}&lowLatency=force`;

    // 5️⃣ Pipe camera → canvas → WHIP
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 360;

    function drawFrame() {
        if (localStream && localStream.active) {
        ctx.drawImage(inputVideo, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
        }
    }
    drawFrame();

    await api.setupWebRTC(canvas);
    console.log('🎉 WebRTC streaming established!');

    const status = await api.getStreamStatus()
    const stream_id = status.id
    console.log("stream_id:", stream_id)
    fetch(`/set_stream_id?stream_id=${stream_id}`)
    } catch (err) {
    console.error('Stream start failed:', err);
    alert('Error: ' + err.message);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    }
}

async function stopStream() {
    try {
    await api.deleteStream();
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
    }
    outputVideo.src = '';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    console.log('🛑 Stream stopped');
    } catch (err) {
    console.error('Failed to stop stream:', err);
    }
}

startBtn.onclick = startStream;
stopBtn.onclick = stopStream;