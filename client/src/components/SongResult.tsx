import { useState } from 'react';
import type { RecognitionResult } from '../types';

interface SongResultProps {
  result: RecognitionResult;
  onIdentifyAnother: () => void;
}

export function SongResult({ result, onIdentifyAnother }: SongResultProps) {
  const [imageError, setImageError] = useState(false);

  const { title, artist, album, albumArt, releaseDate, genres, externalLinks } = result;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <div className="animate-fade-in-up w-full max-w-md mx-auto px-4">
      {/* Album Art */}
      <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 mb-8 rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(124,106,240,0.2)]">
        {albumArt && !imageError ? (
          <img
            src={albumArt}
            alt={`${album || title} album artwork`}
            className="w-full h-full object-cover"
            loading="eager"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V4.103A2.25 2.25 0 0016.373 2.05l-7.5 2.143A2.25 2.25 0 007.5 6.336v7.528"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 16.136V6.336l10.5-3V13.86M7.5 16.136a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66A2.25 2.25 0 007.5 16.136z"
              />
            </svg>
          </div>
        )}

        {/* Subtle reflection effect */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-surface-0/60 via-transparent to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Song Info */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight truncate">
          {title}
        </h2>
        <p className="text-lg text-text-secondary truncate">{artist}</p>
        {album && (
          <p className="text-sm text-text-muted truncate">
            {album}
            {year ? ` · ${year}` : ''}
          </p>
        )}
        {genres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 text-xs font-medium text-accent-light bg-accent-dim rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* External Links */}
      <div className="flex justify-center gap-3 mb-8">
        {externalLinks.spotify && (
          <ExternalLink
            href={externalLinks.spotify}
            label="Open in Spotify"
            icon={<SpotifyIcon />}
          />
        )}
        {externalLinks.appleMusic && (
          <ExternalLink
            href={externalLinks.appleMusic}
            label="Open in Apple Music"
            icon={<AppleMusicIcon />}
          />
        )}
        {externalLinks.youtube && (
          <ExternalLink
            href={externalLinks.youtube}
            label="Watch on YouTube"
            icon={<YouTubeIcon />}
          />
        )}
        {/* Fallback: search on YouTube if no direct link */}
        {!externalLinks.youtube && (
          <ExternalLink
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`}
            label="Search on YouTube"
            icon={<YouTubeIcon />}
          />
        )}
      </div>

      {/* Identify Another */}
      <div className="text-center">
        <button
          type="button"
          onClick={onIdentifyAnother}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-2 hover:bg-surface-3 text-text-primary text-sm font-medium transition-all duration-200 cursor-pointer hover:shadow-[0_0_30px_rgba(124,106,240,0.15)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          Identify another song
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ExternalLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-2 hover:bg-surface-3 text-text-secondary hover:text-text-primary transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,106,240,0.1)]"
    >
      {icon}
    </a>
  );
}

function SpotifyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.225C18.959.098 18.21.06 17.457.024A69.584 69.584 0 0015.61 0H8.39a69.51 69.51 0 00-1.847.024c-.752.036-1.5.073-2.242.201A5.023 5.023 0 002.426.891C1.308 1.624.563 2.624.246 3.934a9.218 9.218 0 00-.24 2.19C-.004 6.636-.01 7.148 0 7.66v8.68c-.01.512.004 1.024.014 1.536a9.237 9.237 0 00.24 2.19c.317 1.31 1.062 2.31 2.18 3.043a5.02 5.02 0 001.874.666c.741.128 1.49.165 2.242.201a69.494 69.494 0 001.847.024h7.22c.65.01 1.3-.004 1.947-.024.753-.036 1.5-.073 2.242-.201a5.023 5.023 0 001.874-.666c1.118-.733 1.863-1.733 2.18-3.043a9.23 9.23 0 00.24-2.19c.01-.512.014-1.024.004-1.536V7.66c.01-.512-.004-1.024-.014-1.536zM16.95 17.07c0 .355-.053.705-.143 1.03-.207.75-.72 1.217-1.46 1.418-.413.112-.843.147-1.276.122a8.01 8.01 0 01-.972-.094 1.773 1.773 0 01-1.403-1.103 2.27 2.27 0 01-.174-.868V11.12l-5.678 1.35v5.86c0 .363-.043.72-.143 1.06-.226.77-.744 1.24-1.5 1.42-.41.097-.83.123-1.254.097a9.394 9.394 0 01-.898-.079 1.798 1.798 0 01-1.468-1.142 2.297 2.297 0 01-.17-.86c-.01-.735.477-1.44 1.163-1.676.354-.122.726-.182 1.103-.21.388-.03.778-.045 1.13-.147.296-.086.468-.3.514-.604.02-.126.024-.254.024-.382V7.57c0-.282.038-.558.128-.824.16-.475.514-.764.994-.884l6.65-1.584c.234-.056.473-.1.716-.116.38-.026.664.132.816.484.07.162.1.336.1.514l.003 11.91z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
