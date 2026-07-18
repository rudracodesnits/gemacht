import { useState } from 'react';
import { useRecognition } from './hooks/useRecognition';
import { RecognitionButton } from './components/RecognitionButton';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SongResult } from './components/SongResult';
import { ErrorState, NoMatchState } from './components/ErrorState';
import { HistoryPanel } from './components/HistoryPanel';
import type { RecognitionResult } from './types';

export function App() {
  const {
    state,
    startIdentification,
    stopEarly,
    cancel,
    reset,
    analyserNode,
    history,
    recordingDurationMs,
  } = useRecognition();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<RecognitionResult | null>(null);

  const { phase } = state;
  const isListening = phase === 'listening';
  const elapsed = phase === 'listening' ? state.elapsed : 0;

  const handleStartLive = () => {
    setSelectedSong(null);
    startIdentification();
  };

  const handleReset = () => {
    setSelectedSong(null);
    reset();
  };

  const showResult = selectedSong || (phase === 'success' ? state.result : null);

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden safe-top safe-bottom p-6 md:p-8 bg-surface-0 text-text-primary">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Subtle geometric logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-light flex items-center justify-center shadow-lg shadow-accent/20">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            gemacht
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-1 hover:bg-surface-2 border border-white/5 hover:border-white/10 transition-all text-sm font-medium cursor-pointer"
          aria-label="Open recognition history"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>History</span>
          {history.entries.length > 0 && (
            <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white leading-none">
              {history.entries.length}
            </span>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-8 w-full max-w-xl mx-auto">
        {showResult ? (
          <SongResult result={showResult} onIdentifyAnother={handleReset} />
        ) : phase === 'error' ? (
          <ErrorState
            message={state.message}
            errorType={state.errorType}
            onRetry={handleStartLive}
          />
        ) : phase === 'no-match' ? (
          <NoMatchState message={state.message} onRetry={handleStartLive} />
        ) : (
          <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
            {/* Audio frequency visualization in background */}
            <AudioVisualizer analyserNode={analyserNode} isActive={isListening} />

            <div className="relative z-10 text-center">
              <RecognitionButton
                state={state}
                onStart={handleStartLive}
                onStop={stopEarly}
                onCancel={cancel}
                elapsed={elapsed}
                durationMs={recordingDurationMs}
              />
              {phase === 'idle' && (
                <p className="mt-6 text-sm text-text-muted max-w-[200px] mx-auto leading-relaxed">
                  Tap to identify music playing around you
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-4">
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          Your privacy matters. Microphone samples are only captured when listening and sent securely to our backend for recognition. We never store your audio files.
        </p>
        <p className="text-[10px] text-text-muted/40 font-mono">
          gemacht v1.0.0
        </p>
      </footer>

      {/* History Modal Overlay */}
      {isHistoryOpen && (
        <HistoryPanel
          entries={history.entries}
          onSelect={(song) => {
            setSelectedSong(song);
            setIsHistoryOpen(false);
          }}
          onRemove={history.removeEntry}
          onClear={history.clearHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
