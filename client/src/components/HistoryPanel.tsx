import { useState } from 'react';
import type { HistoryEntry, RecognitionResult } from '../types';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onSelect: (result: RecognitionResult) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function HistoryPanel({ entries, onSelect, onRemove, onClear, onClose }: HistoryPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSelect = (entry: HistoryEntry) => {
    const result: RecognitionResult = {
      title: entry.title,
      artist: entry.artist,
      album: entry.album,
      albumArt: entry.albumArt,
      releaseDate: null,
      durationMs: null,
      genres: [],
      externalLinks: entry.externalLinks,
    };
    onSelect(result);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Recognition history"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[85dvh] bg-surface-1 rounded-t-2xl sm:rounded-2xl overflow-hidden animate-fade-in-up safe-bottom flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-text-primary">History</h2>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Clear all?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClear();
                        setConfirmClear(false);
                      }}
                      className="text-xs text-error hover:text-error/80 font-medium cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="text-xs text-text-muted hover:text-text-secondary cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="text-xs text-text-muted hover:text-error transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history"
              className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <svg
                className="w-12 h-12 text-text-muted mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-text-muted text-sm">No songs identified yet</p>
              <p className="text-text-muted/60 text-xs mt-1">
                Your recognized songs will appear here
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {entries.map((entry) => (
                <li key={entry.id} className="group">
                  <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors">
                    {/* Artwork */}
                    <button
                      type="button"
                      onClick={() => handleSelect(entry)}
                      className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-2 cursor-pointer"
                      aria-label={`View ${entry.title} by ${entry.artist}`}
                    >
                      {entry.albumArt ? (
                        <img
                          src={entry.albumArt}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V4.103A2.25 2.25 0 0016.373 2.05l-7.5 2.143A2.25 2.25 0 007.5 6.336v7.528" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <button
                      type="button"
                      onClick={() => handleSelect(entry)}
                      className="flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <p className="text-sm font-medium text-text-primary truncate">
                        {entry.title}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{entry.artist}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatRelativeTime(entry.recognizedAt)}
                      </p>
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      aria-label={`Remove ${entry.title} from history`}
                      className="shrink-0 p-1.5 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
