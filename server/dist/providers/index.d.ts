import type { MusicRecognitionProvider } from '../types.js';
export type ProviderName = 'mock' | 'acrcloud';
/**
 * Factory function to create the configured recognition provider.
 * Reads from MUSIC_RECOGNITION_PROVIDER env var (defaults to 'mock').
 */
export declare function createProvider(): MusicRecognitionProvider;
//# sourceMappingURL=index.d.ts.map