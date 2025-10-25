'use client';

import { useRef, useState, useEffect } from 'react';

export default function WebcamStream({ isStreaming, onStart, onStop }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isStreaming) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isStreaming]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam. Please check permissions.');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <p className="text-white text-xl mb-4">Ready to start streaming</p>
              <button
                onClick={onStart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🎥 Start Stream
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
            <div className="text-center text-white">
              <p className="text-xl mb-2">❌ {error}</p>
              <button
                onClick={onStart}
                className="px-4 py-2 bg-white text-red-900 rounded hover:bg-gray-100"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {isStreaming && (
        <div className="p-4 bg-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-medium">LIVE</span>
            </span>
            <span className="text-gray-400 text-sm">Streaming and listening...</span>
          </div>
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            ⏹️ Stop
          </button>
        </div>
      )}
    </div>
  );
}
