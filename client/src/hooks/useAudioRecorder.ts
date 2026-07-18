import { useCallback, useRef, useState } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<MediaStream>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  error: string | null;
  analyserNode: AnalyserNode | null;
}

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function getSupportedMimeType(): string {
  for (const mime of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return '';
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const resolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanup = useCallback(() => {
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => { /* ignore close errors */ });
      audioContextRef.current = null;
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setAnalyserNode(null);
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async (): Promise<MediaStream> => {
    setError(null);

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Your browser does not support audio recording.');
      throw new Error('unsupported');
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('Your browser does not support audio recording.');
      throw new Error('unsupported');
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('No supported audio format found in this browser.');
      throw new Error('unsupported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Set up AnalyserNode for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (resolveRef.current) {
          resolveRef.current(blob);
          resolveRef.current = null;
        }
        cleanup();
      };

      recorder.onerror = () => {
        setError('Recording failed. Please try again.');
        if (resolveRef.current) {
          resolveRef.current(null);
          resolveRef.current = null;
        }
        cleanup();
      };

      recorder.start(250); // collect data every 250ms
      setIsRecording(true);

      return stream;
    } catch (err: unknown) {
      cleanup();

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone access was denied. Please allow microphone access to identify music.');
          throw new Error('mic-denied');
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
          throw new Error('mic-unavailable');
        }
      }

      setError('Could not access the microphone. Please try again.');
      throw new Error('unknown');
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      resolveRef.current = resolve;
      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Override the onstop so we don't resolve with data
      mediaRecorderRef.current.onstop = () => {
        cleanup();
      };
      mediaRecorderRef.current.stop();
    } else {
      cleanup();
    }
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
  }, [cleanup]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    analyserNode,
  };
}
