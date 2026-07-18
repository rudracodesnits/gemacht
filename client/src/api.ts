import type { RecognitionApiResponse } from './types';

const API_BASE = '/api';
const RECOGNIZE_TIMEOUT = 30_000;

export async function recognizeSong(audioBlob: Blob): Promise<RecognitionApiResponse> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RECOGNIZE_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE}/recognize`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (response.status === 429) {
      return {
        status: 'error',
        result: null,
        message: 'Too many requests. Please wait a moment and try again.',
      };
    }

    if (response.status === 413) {
      return {
        status: 'error',
        result: null,
        message: 'Audio recording is too large. Try a shorter recording.',
      };
    }

    const data: RecognitionApiResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'error',
        result: null,
        message: 'Recognition request timed out. Please try again.',
      };
    }

    return {
      status: 'error',
      result: null,
      message: 'Could not connect to the server. Check your connection and try again.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
