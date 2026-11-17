import { useState, useRef, useEffect, useCallback } from 'react';

export interface CapturedMedia {
  type: 'photo' | 'video';
  dataUrl: string;
  blob: Blob;
  durationSeconds?: number;
  posterDataUrl?: string;
  posterBlob?: Blob;
}

const MIN_VIDEO_SECONDS = 3.0;
const MAX_VIDEO_SECONDS = 5.0;

function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) return '';
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
  ];
  for (const candidate of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore query errors in restricted environments
    }
  }
  return '';
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const minTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStopRequestedRef = useRef<boolean>(false);
  const posterMediaRef = useRef<{ dataUrl: string; blob: Blob } | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);

  // Video recording states for Snapchat-style animation
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0); // 0 to 1
  const [recordingElapsedSeconds, setRecordingElapsedSeconds] = useState(0);

  // Stop camera tracks
  const stopStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (minTimerRef.current) {
      clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRecordingVideo(false);
    setRecordingProgress(0);
    setRecordingElapsedSeconds(0);
  }, []);

  // Start camera stream via navigator.mediaDevices.getUserMedia ONLY
  const startStream = useCallback(async () => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API (getUserMedia) is not supported by your browser or security context.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.warn('Video play error:', err);
          });
          setIsStreaming(true);
        };
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser address bar.');
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        setCameraError('No camera detected on this device.');
      } else {
        setCameraError(`Unable to start camera: ${errorObj.message || 'Unknown error'}`);
      }
      setIsStreaming(false);
    }
  }, [facingMode, stopStream]);

  // Flip between rear/environment and front/user camera
  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  }, []);

  // Internal helper to capture current frame to canvas with civic watermark
  const captureFrameToBlob = useCallback((): { dataUrl: string; blob: Blob } | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Overlay civic timestamp watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `Civic Connect Verified Live Capture · ${new Date().toLocaleString()}`,
      16,
      canvas.height - 15
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    return { dataUrl, blob };
  }, []);

  // Capture single high-res photo to canvas
  const takePhoto = useCallback((): CapturedMedia | null => {
    if (!isStreaming) return null;
    const frame = captureFrameToBlob();
    if (!frame) return null;

    const media: CapturedMedia = {
      type: 'photo',
      dataUrl: frame.dataUrl,
      blob: frame.blob,
    };

    setCapturedMedia(media);
    return media;
  }, [isStreaming, captureFrameToBlob]);

  // Actually finalize and stop recorder
  const finalizeRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (minTimerRef.current) {
      clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping media recorder:', err);
      }
    }
  }, []);

  // Start video recording (called when user holds shutter button)
  const startVideoRecording = useCallback(() => {
    if (!streamRef.current || !isStreaming) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') return;

    // Grab poster frame immediately at start of recording
    posterMediaRef.current = captureFrameToBlob();
    recordedChunksRef.current = [];
    isStopRequestedRef.current = false;

    const mimeType = getSupportedMimeType();

    try {
      const options: MediaRecorderOptions = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, {
          type: mimeType || 'video/webm',
        });
        const videoUrl = URL.createObjectURL(fullBlob);
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        const durationSeconds = Math.max(MIN_VIDEO_SECONDS, Math.min(MAX_VIDEO_SECONDS, Math.round(elapsed * 10) / 10));

        setCapturedMedia({
          type: 'video',
          dataUrl: videoUrl,
          blob: fullBlob,
          durationSeconds,
          posterDataUrl: posterMediaRef.current?.dataUrl,
          posterBlob: posterMediaRef.current?.blob,
        });

        setIsRecordingVideo(false);
        setRecordingProgress(0);
        setRecordingElapsedSeconds(0);
      };

      recorder.start(100); // chunk every 100ms
      recordingStartTimeRef.current = Date.now();
      setIsRecordingVideo(true);
      setRecordingProgress(0);
      setRecordingElapsedSeconds(0);

      // Animation loop for smooth Snapchat progress ring
      const updateProgress = () => {
        const elapsedMs = Date.now() - recordingStartTimeRef.current;
        const elapsedSec = elapsedMs / 1000;
        const progress = Math.min(1, elapsedSec / MAX_VIDEO_SECONDS);

        setRecordingElapsedSeconds(Math.min(MAX_VIDEO_SECONDS, elapsedSec));
        setRecordingProgress(progress);

        if (elapsedSec >= MAX_VIDEO_SECONDS) {
          // Reached max 5s limit -> auto-stop
          finalizeRecording();
        } else if (isStopRequestedRef.current && elapsedSec >= MIN_VIDEO_SECONDS) {
          // User released hold and minimum 3s reached -> stop now
          finalizeRecording();
        } else {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } catch (err) {
      console.error('MediaRecorder start failed:', err);
      setCameraError('Video recording not supported on this device/browser.');
      setIsRecordingVideo(false);
    }
  }, [isStreaming, captureFrameToBlob, finalizeRecording]);

  // Stop video recording (called when user releases shutter button)
  const stopVideoRecording = useCallback(() => {
    if (!isRecordingVideo) return;
    isStopRequestedRef.current = true;

    const elapsedMs = Date.now() - recordingStartTimeRef.current;
    const elapsedSec = elapsedMs / 1000;

    if (elapsedSec >= MIN_VIDEO_SECONDS) {
      // Already past minimum 3s, finish immediately
      finalizeRecording();
    } else {
      // Less than 3s: keep recording until minimum 3.0s is reached
      const remainingMs = Math.max(100, (MIN_VIDEO_SECONDS - elapsedSec) * 1000);
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      minTimerRef.current = setTimeout(() => {
        finalizeRecording();
      }, remainingMs);
    }
  }, [isRecordingVideo, finalizeRecording]);

  const clearCapturedMedia = useCallback(() => {
    setCapturedMedia(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    isStreaming,
    cameraError,
    facingMode,
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
  };
}
