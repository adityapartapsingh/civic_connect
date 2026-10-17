import { useState, useRef, useEffect, useCallback } from 'react';

export interface CapturedMedia {
  type: 'photo' | 'video';
  dataUrl: string;
  blob: Blob;
  durationSeconds?: number;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);

  // Video recording states
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSecondsLeft, setRecordingSecondsLeft] = useState(3);

  // Stop camera tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Start camera stream via navigator.mediaDevices.getUserMedia ONLY
  const startStream = useCallback(async () => {
    stopStream();
    setCameraError(null);

    // Guard against environments without mediaDevices
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

  // Capture single high-res photo to canvas
  const takePhoto = useCallback((): CapturedMedia | null => {
    if (!videoRef.current || !isStreaming) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw the current video frame onto canvas
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

    // Create binary blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const media: CapturedMedia = {
      type: 'photo',
      dataUrl,
      blob,
    };

    setCapturedMedia(media);
    return media;
  }, [isStreaming]);

  // Record a mandatory 3-second pan video for critical evidence
  const recordThreeSecondPanVideo = useCallback(() => {
    if (!streamRef.current || !isStreaming || isRecordingVideo) return;

    recordedChunksRef.current = [];
    let mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(fullBlob);

        setCapturedMedia({
          type: 'video',
          dataUrl: videoUrl,
          blob: fullBlob,
          durationSeconds: 3,
        });
        setIsRecordingVideo(false);
      };

      recorder.start();
      setIsRecordingVideo(true);
      setRecordingSecondsLeft(3);

      let counter = 3;
      const interval = setInterval(() => {
        counter -= 1;
        setRecordingSecondsLeft(counter);
        if (counter <= 0) {
          clearInterval(interval);
          if (recorder.state !== 'inactive') {
            recorder.stop();
          }
        }
      }, 1000);
    } catch (e) {
      console.error('MediaRecorder initiation failed', e);
      setCameraError('Video recording not supported on this device.');
      setIsRecordingVideo(false);
    }
  }, [isStreaming, isRecordingVideo]);

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
    recordingSecondsLeft,
    startStream,
    stopStream,
    switchCamera,
    takePhoto,
    recordThreeSecondPanVideo,
    clearCapturedMedia,
  };
}
