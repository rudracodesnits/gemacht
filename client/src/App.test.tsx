import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import * as api from './api';

// Mock the API client
vi.mock('./api', () => ({
  recognizeSong: vi.fn(),
}));

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders landing page with title and initial instructions', () => {
    render(<App />);

    expect(screen.getByText('gemacht')).toBeInTheDocument();
    expect(screen.getByText('Tap to identify music playing around you')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open recognition history/i })).toBeInTheDocument();
  });

  it('opens and closes the history panel', async () => {
    render(<App />);

    const historyBtn = screen.getByRole('button', { name: /open recognition history/i });
    fireEvent.click(historyBtn);

    // Verify history panel is open
    expect(screen.getByRole('dialog', { name: /recognition history/i })).toBeInTheDocument();
    expect(screen.getByText('No songs identified yet')).toBeInTheDocument();

    // Close the panel
    const closeBtn = screen.getByRole('button', { name: /close history/i });
    fireEvent.click(closeBtn);

    // Verify history panel is closed
    expect(screen.queryByRole('dialog', { name: /recognition history/i })).not.toBeInTheDocument();
  });

  it('handles successful song recognition flow (stopping early)', async () => {
    const mockResult = {
      title: 'Mock Song',
      artist: 'Mock Artist',
      album: 'Mock Album',
      albumArt: 'https://example.com/art.jpg',
      releaseDate: '2023-01-01',
      durationMs: 200000,
      genres: ['Pop'],
      externalLinks: {
        spotify: 'https://spotify.com/mock',
        appleMusic: null,
        youtube: null,
      },
    };

    vi.spyOn(api, 'recognizeSong').mockResolvedValue({
      status: 'success',
      result: mockResult,
      message: 'Success',
    });

    render(<App />);

    // Click to identify
    const identifyBtn = screen.getByRole('button', { name: /start identifying music/i });
    fireEvent.click(identifyBtn);

    // Wait for the state to transition to listening
    const listeningBtn = await screen.findByRole('button', { name: /listening/i });

    // Click to stop early
    fireEvent.click(listeningBtn);

    // Should transition to success screen
    await screen.findByText('Mock Song');
    expect(screen.getByText('Mock Artist')).toBeInTheDocument();

    // Verify external link is present
    const spotifyLink = screen.getByRole('link', { name: /open in spotify/i });
    expect(spotifyLink).toHaveAttribute('href', 'https://spotify.com/mock');
  });

  it('handles no match scenario gracefully (stopping early)', async () => {
    vi.spyOn(api, 'recognizeSong').mockResolvedValue({
      status: 'no_match',
      result: null,
      message: 'Could not identify this song. Try moving closer to the music.',
    });

    render(<App />);

    const identifyBtn = screen.getByRole('button', { name: /start identifying music/i });
    fireEvent.click(identifyBtn);

    // Wait for the state to transition to listening
    const listeningBtn = await screen.findByRole('button', { name: /listening/i });

    // Click to stop early
    fireEvent.click(listeningBtn);

    // Wait for "couldn't identify" screen
    await screen.findByText(/couldn't identify this song/i);
    expect(screen.getByText(/try moving closer/i)).toBeInTheDocument();
  });
});
