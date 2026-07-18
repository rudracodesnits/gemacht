/** Normalized recognition result returned by all providers */
export interface RecognitionResult {
    title: string;
    artist: string;
    album: string;
    albumArt: string | null;
    releaseDate: string | null;
    durationMs: number | null;
    genres: string[];
    externalLinks: ExternalLinks;
    providerMetadata: Record<string, unknown>;
}
export interface ExternalLinks {
    spotify: string | null;
    appleMusic: string | null;
    youtube: string | null;
}
/** Recognition status for the API response */
export type RecognitionStatus = 'success' | 'no_match' | 'error';
export interface RecognitionResponse {
    status: RecognitionStatus;
    result: RecognitionResult | null;
    message: string;
}
/** Provider interface — all recognition services implement this */
export interface MusicRecognitionProvider {
    readonly name: string;
    recognize(audioBuffer: Buffer, mimeType: string): Promise<RecognitionResponse>;
}
//# sourceMappingURL=types.d.ts.map