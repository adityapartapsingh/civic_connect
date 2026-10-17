import React, { useEffect, useState } from 'react';
import { useCamera, CapturedMedia } from '../../hooks/useCamera';
import { Camera, RefreshCw, Video, AlertCircle, Check, X, ShieldAlert, Zap } from 'lucide-react';
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
    facingMode,
    capturedMedia,
    isRecordingVideo,
    recordingSecondsLeft,
    startStream,
    stopStream,
    switchCamera,
    takePhoto,
    recordThreeSecondPanVideo,
    clearCapturedMedia,
  } = useCamera();

  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');

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

  return (
    <div className="relative w-full max-w-lg mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col min-h-[520px]">
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-200">
            Live Civic Sensor
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!capturedMedia && isStreaming && (
            <button
              type="button"
              onClick={switchCamera}
              className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
              title="Switch camera"
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
              className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
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
            <div className="absolute top-16 left-4 bg-slate-900/90 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-400 border border-slate-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Verified On-Device Capture</span>
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
            <div className="absolute inset-8 pointer-events-none border border-white/30 rounded-xl flex items-center justify-center">
              <div className="text-[11px] font-mono text-white/80 bg-black/70 px-2.5 py-1 rounded-md">
                Frame civic hazard clearly
              </div>
            </div>

            {/* Recording countdown overlay */}
            {isRecordingVideo && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center pointer-events-none z-30">
                <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center bg-red-600/40">
                  <span className="text-2xl font-bold text-white">{recordingSecondsLeft}</span>
                </div>
                <p className="mt-3 text-sm font-semibold tracking-wide text-white uppercase">
                  Slowly pan camera across issue
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Switcher & Capture Control Bar */}
      <div className="p-5 bg-slate-900 border-t border-slate-800">
        {capturedMedia ? (
          /* Decision controls */
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
              onClick={handleRetake}
              icon={<RefreshCw className="w-4 h-4" />}
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
          /* Live capture buttons */
          <div>
            {/* Mode selection tabs */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-xl bg-slate-800/80 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    activeTab === 'photo'
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Photo Evidence
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    activeTab === 'video'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  3s Pan Video (+10 pts)
                </button>
              </div>
            </div>

            {/* Shutter trigger button */}
            <div className="flex items-center justify-center gap-6">
              {activeTab === 'photo' ? (
                <button
                  type="button"
                  onClick={() => takePhoto()}
                  disabled={!isStreaming || !!cameraError}
                  className="w-18 h-18 p-1 rounded-full border-4 border-white/60 hover:border-white transition flex items-center justify-center group active:scale-90 disabled:opacity-40"
                  aria-label="Capture Photo"
                >
                  <div className="w-14 h-14 rounded-full bg-white group-hover:scale-95 transition-transform shadow-lg shadow-white/20" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={recordThreeSecondPanVideo}
                  disabled={!isStreaming || !!cameraError || isRecordingVideo}
                  className="w-18 h-18 p-1 rounded-full border-4 border-red-400/60 hover:border-red-400 transition flex items-center justify-center group active:scale-90 disabled:opacity-40"
                  aria-label="Record 3-second pan video"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-600 group-hover:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-red-600/30">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </button>
              )}
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
              {activeTab === 'photo'
                ? 'Camera stream captured directly to canvas. No gallery uploads allowed.'
                : 'Records continuous 3-second spatial pan for tamper-proof evidence.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
