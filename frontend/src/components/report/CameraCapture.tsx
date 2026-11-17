import React, { useEffect, useRef } from 'react';
import { useCamera, CapturedMedia } from '../../hooks/useCamera';
import { Camera, RefreshCw, Video, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

interface CameraCaptureProps {
  onCapture: (media: CapturedMedia) => void;
  onCancel?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const {
    videoRef,
    isStreaming,
    cameraError,
    capturedMedia,
    isRecordingVideo,
    recordingProgress,
    recordingElapsedSeconds,
    startStream,
    stopStream,
    switchCamera,
    takePhoto,
    startVideoRecording,
    stopVideoRecording,
    clearCapturedMedia,
  } = useCamera();

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

  const handleConfirmMedia = () => {
    if (capturedMedia) {
      stopStream();
      onCapture(capturedMedia);
    }
  };

  const handleRetake = () => {
    clearCapturedMedia();
    startStream();
  };

  // Snapchat-style press-and-hold handler:
  // Quick Tap (< 250ms) -> Capture Photo
  // Press & Hold (> 250ms) -> Start Video Recording (3s - 5s)
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isStreaming || cameraError) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture isn't supported
    }

    isHoldingRef.current = false;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }

    // 250ms threshold separates a tap from a hold
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      startVideoRecording();
    }, 250);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (isHoldingRef.current || isRecordingVideo) {
      // User was holding -> trigger stop (will complete minimum 3s if needed)
      stopVideoRecording();
    } else {
      // User tapped quickly (< 250ms) -> capture photo
      takePhoto();
    }
    isHoldingRef.current = false;
  };

  const handlePointerCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current || isRecordingVideo) {
      stopVideoRecording();
    }
    isHoldingRef.current = false;
  };

  // Circular progress calculations for Snapchat ring
  // Circumference of radius 40 circle: 2 * PI * 40 ≈ 251.327
  const CIRCLE_RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  const strokeOffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, recordingProgress)));

  return (
    <div className="relative w-full max-w-lg mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 text-white flex flex-col min-h-[520px] shadow-2xl">
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          {isRecordingVideo ? (
            <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>REC {recordingElapsedSeconds.toFixed(1)}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-700/60">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-medium tracking-wide text-slate-200">
                Live Sensor
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!capturedMedia && isStreaming && !isRecordingVideo && (
            <button
              type="button"
              onClick={switchCamera}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-xs text-white hover:bg-slate-800 transition border border-slate-700/50 cursor-pointer"
              title="Flip camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={() => {
                stopStream();
                onCancel();
              }}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-xs text-white hover:bg-slate-800 transition border border-slate-700/50 cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px]">
        {cameraError ? (
          <div className="p-6 text-center max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-900/50 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-white mb-1">Camera Access Required</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{cameraError}</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => startStream()}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Camera Stream
            </Button>
          </div>
        ) : capturedMedia ? (
          /* Preview captured media */
          <div className="relative w-full h-full flex items-center justify-center">
            {capturedMedia.type === 'photo' ? (
              <img
                src={capturedMedia.dataUrl}
                alt="Captured Issue Evidence"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={capturedMedia.dataUrl}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-16 left-4 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 border border-slate-700 flex items-center gap-1.5 shadow-lg">
              <Check className="w-3.5 h-3.5" />
              <span>Verified On-Device {capturedMedia.type === 'photo' ? 'Photo' : 'Video'}</span>
            </div>
          </div>
        ) : (
          /* Live video stream */
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Target Reticle / Viewfinder Frame */}
            {!isRecordingVideo && (
              <div className="absolute inset-8 pointer-events-none border border-white/25 rounded-2xl flex items-center justify-center">
                <div className="text-[11px] font-mono text-white/70 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-md">
                  Frame civic hazard
                </div>
              </div>
            )}

            {/* Subtle red recording border during video capture */}
            {isRecordingVideo && (
              <div className="absolute inset-0 pointer-events-none border-4 border-red-500/70 animate-pulse rounded-2xl" />
            )}
          </div>
        )}
      </div>

      {/* Shutter & Decision Control Bar */}
      <div className="p-5 bg-slate-900 border-t border-slate-800">
        {capturedMedia ? (
          /* Decision controls */
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1 bg-slate-800 text-white font-bold border border-slate-600 hover:bg-slate-700 hover:text-white"
              onClick={handleRetake}
              icon={<RefreshCw className="w-4 h-4 text-white" />}
            >
              Retake
            </Button>
            <Button
              type="button"
              variant="success"
              size="lg"
              className="flex-1"
              onClick={handleConfirmMedia}
              icon={<Check className="w-5 h-5" />}
            >
              Use This {capturedMedia.type === 'photo' ? 'Photo' : 'Video'}
            </Button>
          </div>
        ) : (
          /* Snapchat-style Hold-to-Record Shutter */
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Circular SVG Progress Ring (Rotated -90deg so it fills clockwise from 12 o'clock) */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 96 96"
              >
                {/* Background Ring Track */}
                <circle
                  cx="48"
                  cy="48"
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke={isRecordingVideo ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth="5"
                />
                {/* Active Progress Fill */}
                {isRecordingVideo && (
                  <circle
                    cx="48"
                    cy="48"
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="6"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-75"
                  />
                )}
              </svg>

              {/* Shutter Button (Handles Tap for Photo, Hold for Video) */}
              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onContextMenu={(e) => e.preventDefault()}
                disabled={!isStreaming || !!cameraError}
                aria-label="Capture Photo or Hold for Video"
                className={`relative rounded-full transition-all duration-200 select-none touch-none cursor-pointer flex items-center justify-center ${
                  isRecordingVideo
                    ? 'w-16 h-16 bg-red-600 scale-95 shadow-xl shadow-red-600/50'
                    : 'w-18 h-18 bg-white hover:scale-105 active:scale-95 shadow-lg shadow-white/20'
                }`}
              >
                {isRecordingVideo ? (
                  /* Recording square inside red button */
                  <div className="w-6 h-6 rounded-md bg-white shadow-xs" />
                ) : (
                  /* Photo ring indicator */
                  <div className="w-14 h-14 rounded-full border-2 border-slate-900/15" />
                )}
              </button>
            </div>

            {/* Instruction / Status Guidance */}
            <div className="mt-2.5 text-center">
              {isRecordingVideo ? (
                <p className="text-xs font-bold text-red-400 flex items-center gap-1.5 justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Recording Video · {recordingElapsedSeconds.toFixed(1)}s / 5.0s (Release to finish)
                </p>
              ) : (
                <p className="text-xs text-slate-300 font-medium">
                  Tap for photo · Hold for video
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
