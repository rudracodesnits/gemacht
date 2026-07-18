import type { RecognitionState } from '../types';

interface RecognitionButtonProps {
  state: RecognitionState;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  elapsed: number;
  durationMs: number;
}

export function RecognitionButton({
  state,
  onStart,
  onStop,
  onCancel,
  elapsed,
  durationMs,
}: RecognitionButtonProps) {
  const phase = state.phase;
  const isListening = phase === 'listening';
  const isProcessing = phase === 'processing';
  const isRequesting = phase === 'requesting-mic';
  const isActive = isListening || isProcessing || isRequesting;

  const progress = isListening ? Math.min(elapsed / durationMs, 1) : 0;
  const progressDeg = progress * 360;

  const handleClick = () => {
    if (phase === 'idle' || phase === 'error' || phase === 'no-match' || phase === 'success') {
      onStart();
    } else if (isListening) {
      onStop();
    }
  };

  const getLabel = () => {
    switch (phase) {
      case 'idle':
      case 'success':
      case 'no-match':
      case 'error':
        return 'Tap to identify';
      case 'requesting-mic':
        return 'Requesting\u2026';
      case 'listening':
        return 'Listening\u2026';
      case 'processing':
        return 'Identifying\u2026';
    }
  };

  const getAriaLabel = () => {
    switch (phase) {
      case 'idle':
        return 'Start identifying music';
      case 'requesting-mic':
        return 'Requesting microphone access';
      case 'listening':
        return `Listening for music, ${Math.ceil((durationMs - elapsed) / 1000)} seconds remaining. Press to stop early.`;
      case 'processing':
        return 'Identifying song, please wait';
      case 'success':
        return 'Identify another song';
      case 'no-match':
      case 'error':
        return 'Try again';
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Pulse rings (idle state) */}
      {phase === 'idle' && (
        <>
          <div
            className="absolute rounded-full animate-pulse-ring"
            style={{
              width: 200,
              height: 200,
              border: '1px solid rgba(124, 106, 240, 0.2)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full animate-pulse-ring"
            style={{
              width: 200,
              height: 200,
              border: '1px solid rgba(124, 106, 240, 0.15)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDelay: '0.8s',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Listening wave rings */}
      {isListening && (
        <>
          {[0, 0.6, 1.2].map((delay) => (
            <div
              key={delay}
              className="absolute rounded-full animate-wave"
              style={{
                width: 160,
                height: 160,
                border: '2px solid rgba(124, 106, 240, 0.3)',
                top: '50%',
                left: '50%',
                marginTop: -80,
                marginLeft: -80,
                animationDelay: `${delay}s`,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}

      {/* Main button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing || isRequesting}
        aria-label={getAriaLabel()}
        className={`
          relative z-10 w-40 h-40 rounded-full
          flex items-center justify-center
          transition-all duration-300
          cursor-pointer
          disabled:cursor-wait
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4
          ${isActive
            ? 'bg-accent/20 shadow-[0_0_60px_rgba(124,106,240,0.4)]'
            : 'bg-surface-2 hover:bg-surface-3 shadow-[0_0_40px_rgba(124,106,240,0.2)] hover:shadow-[0_0_60px_rgba(124,106,240,0.35)]'
          }
          ${phase === 'idle' ? 'animate-breathe' : ''}
        `}
      >
        {/* Progress ring */}
        {isListening && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 160 160"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r="76"
              fill="none"
              stroke="rgba(124, 106, 240, 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="80"
              cy="80"
              r="76"
              fill="none"
              stroke="rgba(124, 106, 240, 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 76}`}
              strokeDashoffset={`${2 * Math.PI * 76 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <svg
            className="absolute inset-0 w-full h-full animate-spin-slow"
            viewBox="0 0 160 160"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(124, 106, 240, 0)" />
                <stop offset="100%" stopColor="rgba(124, 106, 240, 0.8)" />
              </linearGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r="76"
              fill="none"
              stroke="url(#spinner-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * 76} ${Math.PI * 76}`}
            />
          </svg>
        )}

        {/* Icon */}
        <div className="flex flex-col items-center gap-1">
          {isProcessing ? (
            <div className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent-light"
                  style={{
                    animation: `pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          ) : (
            <svg
              className={`w-10 h-10 transition-colors duration-300 ${
                isActive ? 'text-accent-light' : 'text-text-secondary'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </div>

        {/* Glow effect */}
        <div
          className={`
            absolute inset-0 rounded-full
            transition-opacity duration-500
            bg-[radial-gradient(circle,rgba(124,106,240,0.15)_0%,transparent_70%)]
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: isListening
              ? `conic-gradient(from ${progressDeg}deg, rgba(124, 106, 240, 0.08), transparent 90%)`
              : undefined,
          }}
          aria-hidden="true"
        />
      </button>

      {/* Status label */}
      <p className="text-sm text-text-secondary font-medium tracking-wide">
        {getLabel()}
      </p>

      {/* Elapsed time */}
      {isListening && (
        <p className="text-xs text-text-muted tabular-nums">
          {(elapsed / 1000).toFixed(1)}s / {(durationMs / 1000).toFixed(0)}s
        </p>
      )}

      {/* Cancel button */}
      {(isListening || isProcessing) && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer underline underline-offset-2"
          aria-label="Cancel recognition"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
