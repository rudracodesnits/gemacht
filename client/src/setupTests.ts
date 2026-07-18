import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockAudioContext {
  state = 'suspended';
  createMediaStreamSource() {
    return {
      connect: () => {},
    };
  }
  createAnalyser() {
    return {
      fftSize: 256,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 128,
      getByteFrequencyData: (array: Uint8Array) => {
        array.fill(128);
      },
      connect: () => {},
    };
  }
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

class MockMediaRecorder {
  state = 'inactive';
  stream: any;
  options: any;
  onstop: any = null;
  onerror: any = null;
  ondataavailable: any = null;

  static isTypeSupported() {
    return true;
  }

  constructor(stream: any, options?: any) {
    this.stream = stream;
    this.options = options;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop({} as any);
    }
  }
}

const mockMediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [
      {
        stop: vi.fn(),
      },
    ],
  }),
};

// Assign mocks to global scope
(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).MediaRecorder = MockMediaRecorder;

Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true,
});
