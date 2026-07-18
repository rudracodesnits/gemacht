"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_js_1 = require("./providers/index.js");
const recognize_js_1 = require("./routes/recognize.js");
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const CLIENT_ORIGIN = process.env['CLIENT_ORIGIN'] ?? 'http://localhost:5173';
const app = (0, express_1.default)();
exports.app = app;
// Security headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS — only allow the configured client origin
app.use((0, cors_1.default)({
    origin: CLIENT_ORIGIN,
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
}));
// Rate limiting on recognition endpoint
const recognizeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        result: null,
        message: 'Too many recognition requests. Please wait a moment and try again.',
    },
});
// Create recognition provider
const provider = (0, index_js_1.createProvider)();
console.log(`Using recognition provider: ${provider.name}`);
// Routes
app.use('/api/recognize', recognizeLimiter, (0, recognize_js_1.createRecognizeRouter)(provider));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', provider: provider.name });
});
// Start server
app.listen(PORT, () => {
    console.log(`Gemacht server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map