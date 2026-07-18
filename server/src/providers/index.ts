import type { MusicRecognitionProvider } from '../types.js';
import { MockProvider } from './mock.js';
import { ACRCloudProvider } from './acrcloud.js';

export type ProviderName = 'mock' | 'acrcloud';

/**
 * Factory function to create the configured recognition provider.
 * Reads from MUSIC_RECOGNITION_PROVIDER env var (defaults to 'mock').
 */
export function createProvider(): MusicRecognitionProvider {
  const providerName = (process.env['MUSIC_RECOGNITION_PROVIDER'] ?? 'mock') as ProviderName;

  switch (providerName) {
    case 'mock':
      return new MockProvider();
    case 'acrcloud':
      return new ACRCloudProvider();
    default:
      console.warn(`Unknown provider "${providerName}", falling back to mock`);
      return new MockProvider();
  }
}
