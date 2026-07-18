import type { MusicRecognitionProvider, RecognitionResponse } from '../types.js';
/**
 * ACRCloud music recognition provider.
 *
 * Requires environment variables:
 *   ACRCLOUD_HOST - e.g. identify-eu-west-1.acrcloud.com
 *   ACRCLOUD_ACCESS_KEY
 *   ACRCLOUD_ACCESS_SECRET
 *
 * API docs: https://docs.acrcloud.com/reference/identification-api
 */
export declare class ACRCloudProvider implements MusicRecognitionProvider {
    readonly name = "acrcloud";
    private readonly host;
    private readonly accessKey;
    private readonly accessSecret;
    constructor();
    recognize(audioBuffer: Buffer, _mimeType: string): Promise<RecognitionResponse>;
    private normalizeResponse;
}
//# sourceMappingURL=acrcloud.d.ts.map