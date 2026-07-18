import { useState, useCallback, useEffect } from 'react';
import type { HistoryEntry, RecognitionResult } from '../types';

const STORAGE_KEY = 'gemacht_history';
const MAX_HISTORY = 100;
const DEDUP_WINDOW_MS = 60_000; // 1 minute

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    // Corrupted data — start fresh
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  // Sync to localStorage whenever entries change
  useEffect(() => {
    saveHistory(entries);
  }, [entries]);

  const addEntry = useCallback((result: RecognitionResult) => {
    setEntries((prev) => {
      // Dedup: don't add if same title+artist within DEDUP_WINDOW_MS
      const isDuplicate = prev.some(
        (entry) =>
          entry.title === result.title &&
          entry.artist === result.artist &&
          Date.now() - entry.recognizedAt < DEDUP_WINDOW_MS
      );

      if (isDuplicate) return prev;

      const newEntry: HistoryEntry = {
        id: generateId(),
        title: result.title,
        artist: result.artist,
        album: result.album,
        albumArt: result.albumArt,
        recognizedAt: Date.now(),
        externalLinks: result.externalLinks,
      };

      return [newEntry, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    removeEntry,
    clearHistory,
  };
}
