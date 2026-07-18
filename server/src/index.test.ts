import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from './index.js';
import type { Server } from 'http';

let server: Server;
let baseUrl: string;

beforeAll(() => {
  return new Promise<void>((resolve) => {
    // Listen on a random free port for testing
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address !== null) {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Express Server API', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string; provider: string };
    expect(data.status).toBe('ok');
    expect(data.provider).toBe('mock');
  });

  it('POST /api/recognize rejects empty payloads with 400', async () => {
    const res = await fetch(`${baseUrl}/api/recognize`, {
      method: 'POST',
    });
    expect(res.status).toBe(400);
    const data = await res.json() as { status: string; message: string };
    expect(data.status).toBe('error');
    expect(data.message).toContain('No audio file provided');
  });

  it('POST /api/recognize rejects invalid mime types', async () => {
    const formData = new FormData();
    const fakeFile = new Blob(['dummy audio content'], { type: 'text/plain' });
    formData.append('audio', fakeFile, 'test.txt');

    const res = await fetch(`${baseUrl}/api/recognize`, {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(400);
    const data = await res.json() as { status: string; message: string };
    expect(data.status).toBe('error');
    expect(data.message).toContain('Unsupported audio format');
  });

  it('POST /api/recognize accepts valid audio formats', async () => {
    const formData = new FormData();
    const fakeFile = new Blob(['dummy audio content'], { type: 'audio/webm' });
    formData.append('audio', fakeFile, 'test.webm');

    const res = await fetch(`${baseUrl}/api/recognize`, {
      method: 'POST',
      body: formData,
    });

    // The mock provider will return success, no_match, or error (yielding 200 or 502)
    expect([200, 502]).toContain(res.status);
    const data = await res.json() as { status: string; message: string };
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('message');
  });
});
