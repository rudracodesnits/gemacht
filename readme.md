# gemacht — Premium Music Recognition Web Application

**gemacht** (German for *"made"* or *"done"*) is a modern, minimal, atmospheric, and highly polished music recognition web application inspired by the core user experience of Shazam. It allows users to tap a button, record a short sample of music playing nearby, and instantly identify the song using browser recording capabilities and a secure backend service.

---

## Features
- **Atmospheric Visual Identity**: Deep charcoal dark-first user interface with smooth glass overlays, subtle ambient radial glows, and elegant typography.
- **Audio-Reactive Visualizer**: An active circular frequency-bar waveform visualizer utilizing the Web Audio API (`AnalyserNode`) that pulses to sound in real-time.
- **Robust Audio Capture**: Gracefully requests microphone permissions, records 10-second clips, allows users to stop recording early, and manages hardware streams securely without resource leaks.
- **Decoupled Architecture**: Features a robust provider pattern abstraction on the backend for recognition services, including a cycling **Mock Provider** for offline developer workflows and an **ACRCloud Provider** for production integrations.
- **LocalStorage History**: Automatically saves recognized tracks locally on the browser so users can browse, re-open streaming links, or clear past entries.
- **Privacy-First Design**: Processes microphone recordings purely in-memory and immediately cleanses resources without writing audio files to disk.

---

## Tech Stack
- **Frontend**: React 19 (TypeScript, Vite 8, Tailwind CSS v4)
- **Backend**: Express 5 (TypeScript, tsx watcher, Helmet, CORS, Express Rate Limit, Multer)
- **Testing**: Vitest, JSDOM, React Testing Library

---

## Directory Structure
```
/
  client/               # Frontend Vite + React SPA
    src/
      assets/           # SVG icons and static assets
      components/       # UI Components (visualizer, history, result, button)
      hooks/            # Custom hooks (useAudioRecorder, useHistory, useRecognition)
      api.ts            # Client API caller
      index.css         # Styling, custom theme, and animations
      App.tsx           # Main application shell
      main.tsx          # App bootstrapper
      setupTests.ts     # Testing setup and browser mocks
      types.ts          # State machine and data types
  server/               # Backend API Server
    src/
      providers/        # Provider abstraction (Mock, ACRCloud)
      routes/           # API routes (/api/recognize)
      index.ts          # Main Express app, middleware, and config
      types.ts          # Shared provider/response interfaces
  .env.example          # Template environment config file
  .env                  # Local developer config file
```

---

## Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation
From the root directory, install dependencies for both the client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables
Create a `.env` file in the root directory (and server/client subdirectories as needed) by copying the template:

```bash
cp .env.example .env
```

Your default `.env` will look like:
```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
MUSIC_RECOGNITION_PROVIDER=mock
```

---

## Music Recognition Providers

### 1. Mock Provider (Default)
When `MUSIC_RECOGNITION_PROVIDER=mock`, the backend will simulate recognition latency (1–3s) and cycle through scenarios to let developers easily test all UI pathways:
- Scenarios cycled: `Success (3x) ➔ No Match (1x) ➔ Success (2x) ➔ Server Error (1x)`
- Returning realistic track data (e.g., *Blinding Lights*, *Bohemian Rhapsody*, *Get Lucky*).

### 2. ACRCloud Integration
To configure production music recognition:
1. Sign up at [ACRCloud](https://www.acrcloud.com/).
2. Create an **Audio Recognition** bucket/project.
3. Update your `.env` with:
   ```env
   MUSIC_RECOGNITION_PROVIDER=acrcloud
   ACRCLOUD_HOST=identify-eu-west-1.acrcloud.com  # Or your assigned host
   ACRCLOUD_ACCESS_KEY=your_access_key
   ACRCLOUD_ACCESS_SECRET=your_access_secret
   ```

---

## Running the Application

To run the full stack locally:

### 1. Start the Backend Server
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### 2. Start the Frontend Dev Server
In a new terminal window:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173 with proxy configuration
```

---

## API Endpoints

### `GET /api/health`
- **Description**: Verification endpoint to check server health and currently selected provider.
- **Response**:
  ```json
  {
    "status": "ok",
    "provider": "mock"
  }
  ```

### `POST /api/recognize`
- **Description**: Securely accepts audio upload, performs validation, forwards payload to the selected provider, and cleanses the memory stream.
- **Request**: `multipart/form-data` with `audio` binary blob.
- **Validation**: Rejects size limit above 5MB, validates MIME types (supports WebM, WAV, OGG, etc.).
- **Response**:
  ```json
  {
    "status": "success",
    "result": {
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "albumArt": "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
      "releaseDate": "2020-03-20",
      "durationMs": 200040,
      "genres": ["synth-pop", "electropop"],
      "externalLinks": {
        "spotify": "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
        "appleMusic": "https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568",
        "youtube": "https://www.youtube.com/watch?v=4NRXx6U8ABQ"
      },
      "providerMetadata": { "provider": "mock", "simulated": true }
    },
    "message": "Song identified successfully"
  }
  ```

---

## Testing & Compilation

### Automated Tests
Run unit tests for both client and server:

```bash
# Test backend
cd server
npm run test

# Test frontend
cd ../client
npm run test
```

### Type Checking & Linting
Verify code health and TypeScript compilation:

```bash
# Typecheck client
cd client
npm run typecheck

# Typecheck server
cd ../server
npm run typecheck

# Lint client code
cd ../client
npm run lint
```

### Production Build Check
Verify production builds are bundling without errors:

```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
```

---

## Privacy Policy
*gemacht* prioritizes user privacy:
- The microphone is requested only after an explicit click/tap on the main button.
- Recorded audio remains inside browser memory buffers until upload and is securely processed on the backend in-memory.
- Recorded audio samples are immediately cleaned up and never stored permanently on our servers or local databases.
