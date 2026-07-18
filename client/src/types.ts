/** Recognition states — explicit state machine */
export type RecognitionState =
  | { phase: 'idle' }
  | { phase: 'requesting-mic' }
  | { phase: 'listening'; startedAt: number; elapsed: number }
  | { phase: 'processing' }
  | { phase: 'success'; result: RecognitionResult }
  | { phase: 'no-match'; message: string }
  | { phase: 'error'; message: string; errorType: ErrorType };

export type ErrorType =
  | 'mic-denied'
  | 'mic-unavailable'
  | 'unsupported'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

/** Normalized recognition result from API */
export interface RecognitionResult {
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  releaseDate: string | null;
  durationMs: number | null;
  genres: string[];
  externalLinks: ExternalLinks;
}

export interface ExternalLinks {
  spotify: string | null;
  appleMusic: string | null;
  youtube: string | null;
}

/** History entry stored in localStorage */
export interface HistoryEntry {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  recognizedAt: number;
  externalLinks: ExternalLinks;
}

/** API response shape */
export interface RecognitionApiResponse {
  status: 'success' | 'no_match' | 'error';
  result: RecognitionResult | null;
  message: string;
}
