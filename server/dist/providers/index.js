"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvider = createProvider;
const mock_js_1 = require("./mock.js");
const acrcloud_js_1 = require("./acrcloud.js");
/**
 * Factory function to create the configured recognition provider.
 * Reads from MUSIC_RECOGNITION_PROVIDER env var (defaults to 'mock').
 */
function createProvider() {
    const providerName = (process.env['MUSIC_RECOGNITION_PROVIDER'] ?? 'mock');
    switch (providerName) {
        case 'mock':
            return new mock_js_1.MockProvider();
        case 'acrcloud':
            return new acrcloud_js_1.ACRCloudProvider();
        default:
            console.warn(`Unknown provider "${providerName}", falling back to mock`);
            return new mock_js_1.MockProvider();
    }
}
//# sourceMappingURL=index.js.map