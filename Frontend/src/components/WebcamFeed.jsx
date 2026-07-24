import React, { useRef, useCallback, useEffect } from "react";

const WebcamFeed = ({ isRunning }) => {
  const videoRef = useRef(null);

  const startWebcam = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [isRunning, startWebcam, stopWebcam]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Live Webcam Feed</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRunning ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
          {isRunning ? 'Active' : 'Off'}
        </span>
      </div>
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${!isRunning && "hidden"}`}
        ></video>
        {!isRunning && <div className="text-slate-400 text-xs">Webcam is off</div>}
      </div>
    </div>
  );
};

export default WebcamFeed;
