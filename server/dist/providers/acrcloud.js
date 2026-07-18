"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACRCloudProvider = void 0;
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
class ACRCloudProvider {
    name = 'acrcloud';
    host;
    accessKey;
    accessSecret;
    constructor() {
        const host = process.env['ACRCLOUD_HOST'];
        const accessKey = process.env['ACRCLOUD_ACCESS_KEY'];
        const accessSecret = process.env['ACRCLOUD_ACCESS_SECRET'];
        if (!host || !accessKey || !accessSecret) {
            throw new Error('ACRCloud provider requires ACRCLOUD_HOST, ACRCLOUD_ACCESS_KEY, and ACRCLOUD_ACCESS_SECRET environment variables');
        }
        this.host = host;
        this.accessKey = accessKey;
        this.accessSecret = accessSecret;
    }
    async recognize(audioBuffer, _mimeType) {
        const crypto = await import('node:crypto');
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const stringToSign = [
            'POST',
            '/v1/identify',
            this.accessKey,
            'audio',
            '1',
            timestamp,
        ].join('\n');
        const signature = crypto
            .createHmac('sha1', this.accessSecret)
            .update(Buffer.from(stringToSign, 'utf-8'))
            .digest()
            .toString('base64');
        const formData = new FormData();
        formData.append('sample', new Blob([audioBuffer]), 'sample.wav');
        formData.append('sample_bytes', audioBuffer.length.toString());
        formData.append('access_key', this.accessKey);
        formData.append('data_type', 'audio');
        formData.append('signature_version', '1');
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`https://${this.host}/v1/identify`, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });
            if (!response.ok) {
                return {
                    status: 'error',
                    result: null,
                    message: 'Recognition service returned an error. Please try again.',
                };
            }
            const data = await response.json();
            return this.normalizeResponse(data);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    status: 'error',
                    result: null,
                    message: 'Recognition request timed out. Please try again.',
                };
            }
            return {
                status: 'error',
                result: null,
                message: 'Could not connect to recognition service. Please try again.',
            };
        }
        finally {
            clearTimeout(timeout);
        }
    }
    normalizeResponse(data) {
        if (data.status.code === 0 && data.metadata?.music?.length) {
            const track = data.metadata.music[0];
            const spotifyLink = track.external_metadata?.spotify?.track?.id
                ? `https://open.spotify.com/track/${track.external_metadata.spotify.track.id}`
                : null;
            const youtubeLink = track.external_metadata?.youtube?.vid
                ? `https://www.youtube.com/watch?v=${track.external_metadata.youtube.vid}`
                : null;
            return {
                status: 'success',
                result: {
                    title: track.title,
                    artist: track.artists?.map((a) => a.name).join(', ') ?? 'Unknown Artist',
                    album: track.album?.name ?? '',
                    albumArt: track.external_metadata?.spotify?.album?.id
                        ? `https://i.scdn.co/image/${track.external_metadata.spotify.album.id}`
                        : null,
                    releaseDate: track.release_date ?? null,
                    durationMs: track.duration_ms ?? null,
                    genres: track.genres?.map((g) => g.name) ?? [],
                    externalLinks: {
                        spotify: spotifyLink,
                        appleMusic: null,
                        youtube: youtubeLink,
                    },
                    providerMetadata: {
                        provider: 'acrcloud',
                        score: track.score,
                        acrId: track.acrid,
                    },
                },
                message: 'Song identified successfully',
            };
        }
        if (data.status.code === 1001) {
            return {
                status: 'no_match',
                result: null,
                message: 'Could not identify this song. Try moving closer to the music or reducing background noise.',
            };
        }
        return {
            status: 'error',
            result: null,
            message: 'Recognition service encountered an error. Please try again.',
        };
    }
}
exports.ACRCloudProvider = ACRCloudProvider;
//# sourceMappingURL=acrcloud.js.map