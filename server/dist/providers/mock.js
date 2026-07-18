"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
const MOCK_SONGS = [
    {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        releaseDate: '2020-03-20',
        durationMs: 200040,
        genres: ['synth-pop', 'electropop', 'new wave'],
        externalLinks: {
            spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
            appleMusic: 'https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568',
            youtube: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
        },
    },
    {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
        releaseDate: '1975-10-31',
        durationMs: 354320,
        genres: ['rock', 'progressive rock', 'hard rock'],
        externalLinks: {
            spotify: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J',
            appleMusic: 'https://music.apple.com/us/album/bohemian-rhapsody/1440806041?i=1440806768',
            youtube: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        },
    },
    {
        title: 'Get Lucky',
        artist: 'Daft Punk ft. Pharrell Williams',
        album: 'Random Access Memories',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937',
        releaseDate: '2013-05-17',
        durationMs: 369000,
        genres: ['disco', 'funk', 'electronic'],
        externalLinks: {
            spotify: 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof',
            appleMusic: 'https://music.apple.com/us/album/get-lucky-feat-pharrell-williams-nile-rodgers/617154241?i=617154250',
            youtube: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
        },
    },
    {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69',
        releaseDate: '1971-11-08',
        durationMs: 482000,
        genres: ['rock', 'hard rock', 'classic rock'],
        externalLinks: {
            spotify: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc',
            appleMusic: null,
            youtube: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
        },
    },
    {
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        albumArt: 'https://i.scdn.co/image/ab67616d0000b273d4daf28d55fe4197ede848be',
        releaseDate: '2020-03-27',
        durationMs: 203064,
        genres: ['pop', 'disco-pop', 'dance-pop'],
        externalLinks: {
            spotify: 'https://open.spotify.com/track/39LLxExYz6ewLAo9HMFI2l',
            appleMusic: 'https://music.apple.com/us/album/levitating/1510821672?i=1510821685',
            youtube: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
        },
    },
];
class MockProvider {
    name = 'mock';
    scenarioIndex = 0;
    /**
     * Cycle through scenarios: success (3x), no_match (1x), error (1x).
     * This gives a realistic feel during development while covering all states.
     */
    getNextScenario() {
        const scenarios = [
            'success', 'success', 'success', 'no_match', 'success', 'success', 'error',
        ];
        const scenario = scenarios[this.scenarioIndex % scenarios.length];
        this.scenarioIndex++;
        return scenario;
    }
    async recognize(_audioBuffer, _mimeType) {
        const scenario = this.getNextScenario();
        // Simulate network latency (1–3 seconds)
        const delay = 1000 + Math.random() * 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        switch (scenario) {
            case 'success': {
                const song = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];
                return {
                    status: 'success',
                    result: {
                        ...song,
                        providerMetadata: { provider: 'mock', simulated: true },
                    },
                    message: 'Song identified successfully',
                };
            }
            case 'no_match':
                return {
                    status: 'no_match',
                    result: null,
                    message: 'Could not identify this song. Try moving closer to the music or reducing background noise.',
                };
            case 'error':
                return {
                    status: 'error',
                    result: null,
                    message: 'Recognition service temporarily unavailable. Please try again.',
                };
        }
    }
}
exports.MockProvider = MockProvider;
//# sourceMappingURL=mock.js.map