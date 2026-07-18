import type { ErrorType } from '../types';

interface ErrorStateProps {
  message: string;
  errorType: ErrorType;
  onRetry: () => void;
}

function getErrorIcon(errorType: ErrorType): React.ReactNode {
  switch (errorType) {
    case 'mic-denied':
    case 'mic-unavailable':
      return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      );
    case 'network':
    case 'timeout':
    case 'server':
      return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      );
    default:
      return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

function getHelpText(errorType: ErrorType): string | null {
  switch (errorType) {
    case 'mic-denied':
      return 'Check your browser settings to allow microphone access for this site.';
    case 'mic-unavailable':
      return 'Make sure a microphone is connected and not in use by another application.';
    case 'unsupported':
      return 'Try using a modern browser like Chrome, Firefox, or Safari.';
    case 'network':
      return 'Check your internet connection and try again.';
    case 'timeout':
      return 'The request took too long. Try again in a moment.';
    default:
      return null;
  }
}

export function ErrorState({ message, errorType, onRetry }: ErrorStateProps) {
  const helpText = getHelpText(errorType);

  return (
    <div className="animate-fade-in-up w-full max-w-sm mx-auto px-4 text-center">
      <div className="text-error/70 mb-4 flex justify-center">
        {getErrorIcon(errorType)}
      </div>

      <p className="text-text-primary font-medium mb-2">{message}</p>

      {helpText && (
        <p className="text-sm text-text-muted mb-6">{helpText}</p>
      )}

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-2 hover:bg-surface-3 text-text-primary text-sm font-medium transition-all duration-200 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}

/* ── No Match State ── */

interface NoMatchStateProps {
  message: string;
  onRetry: () => void;
}

export function NoMatchState({ message, onRetry }: NoMatchStateProps) {
  return (
    <div className="animate-fade-in-up w-full max-w-sm mx-auto px-4 text-center">
      <div className="text-warning/70 mb-4 flex justify-center">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>

      <p className="text-text-primary font-medium mb-2">Couldn&apos;t identify this song</p>

      <p className="text-sm text-text-muted mb-6">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-2 hover:bg-surface-3 text-text-primary text-sm font-medium transition-all duration-200 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
        Try again
      </button>
    </div>
  );
}
