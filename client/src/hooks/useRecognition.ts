import { useCallback, useRef, useState, useEffect } from 'react';
import type { RecognitionState } from '../types';
import { useAudioRecorder } from './useAudioRecorder';
import { useHistory } from './useHistory';
import { recognizeSong } from '../api';

const RECORDING_DURATION_MS = 10_000; // 10 seconds
const ELAPSED_INTERVAL_MS = 100;

export function useRecognition() {
  const [state, setState] = useState<RecognitionState>({ phase: 'idle' });
  const { startRecording, stopRecording, cancelRecording, analyserNode } = useAudioRecorder();
  const history = useHistory();

  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isCancelledRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const processRecording = useCallback(
    async (blob: Blob) => {
      setState({ phase: 'processing' });

      const response = await recognizeSong(blob);

      // Don't update state if cancelled during processing
      if (isCancelledRef.current) return;

      switch (response.status) {
        case 'success':
          if (response.result) {
            history.addEntry(response.result);
            setState({ phase: 'success', result: response.result });
          } else {
            setState({
              phase: 'no-match',
              message: 'Received an incomplete result. Please try again.',
            });
          }
          break;

        case 'no_match':
          setState({
            phase: 'no-match',
            message: response.message,
          });
          break;

        case 'error':
          setState({
            phase: 'error',
            message: response.message,
            errorType: 'server',
          });
          break;
      }
    },
    [history]
  );

  const startIdentification = useCallback(async () => {
    isCancelledRef.current = false;
    setState({ phase: 'requesting-mic' });

    try {
      await startRecording();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'unknown';

      switch (message) {
        case 'mic-denied':
          setState({
            phase: 'error',
            message: 'Microphone access was denied. Please allow microphone access in your browser settings to identify music.',
            errorType: 'mic-denied',
          });
          return;
        case 'mic-unavailable':
          setState({
            phase: 'error',
            message: 'No microphone found. Please connect a microphone and try again.',
            errorType: 'mic-unavailable',
          });
          return;
        case 'unsupported':
          setState({
            phase: 'error',
            message: 'Your browser does not support audio recording. Please try a modern browser like Chrome, Firefox, or Safari.',
            errorType: 'unsupported',
          });
          return;
        default:
          setState({
            phase: 'error',
            message: 'Could not start recording. Please try again.',
            errorType: 'unknown',
          });
          return;
      }
    }

    // Start listening state
    startTimeRef.current = Date.now();
    setState({
      phase: 'listening',
      startedAt: startTimeRef.current,
      elapsed: 0,
    });

    // Update elapsed time
    elapsedTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phase !== 'listening') return prev;
        return {
          ...prev,
          elapsed: Date.now() - startTimeRef.current,
        };
      });
    }, ELAPSED_INTERVAL_MS);

    // Auto-stop after duration
    recordingTimerRef.current = setTimeout(async () => {
      clearTimers();

      if (isCancelledRef.current) return;

      const blob = await stopRecording();
      if (blob && !isCancelledRef.current) {
        await processRecording(blob);
      }
    }, RECORDING_DURATION_MS);
  }, [startRecording, stopRecording, clearTimers, processRecording]);

  const stopEarly = useCallback(async () => {
    clearTimers();
    const blob = await stopRecording();
    if (blob && !isCancelledRef.current) {
      await processRecording(blob);
    }
  }, [clearTimers, stopRecording, processRecording]);

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    clearTimers();
    cancelRecording();
    setState({ phase: 'idle' });
  }, [clearTimers, cancelRecording]);

  const reset = useCallback(() => {
    isCancelledRef.current = false;
    setState({ phase: 'idle' });
  }, []);

  return {
    state,
    startIdentification,
    stopEarly,
    cancel,
    reset,
    analyserNode,
    history,
    recordingDurationMs: RECORDING_DURATION_MS,
  };
}
