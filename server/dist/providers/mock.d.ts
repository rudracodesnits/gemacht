import type { MusicRecognitionProvider, RecognitionResponse } from '../types.js';
export declare class MockProvider implements MusicRecognitionProvider {
    readonly name = "mock";
    private scenarioIndex;
    /**
     * Cycle through scenarios: success (3x), no_match (1x), error (1x).
     * This gives a realistic feel during development while covering all states.
     */
    private getNextScenario;
    recognize(_audioBuffer: Buffer, _mimeType: string): Promise<RecognitionResponse>;
}
//# sourceMappingURL=mock.d.ts.map