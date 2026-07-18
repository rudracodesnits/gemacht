"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecognizeRouter = createRecognizeRouter;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ALLOWED_MIME_TYPES = new Set([
    'audio/webm',
    'audio/ogg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/mpeg',
    'audio/mp3',
    'audio/aac',
    'audio/flac',
    'audio/webm;codecs=opus',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        // Browser MIME types can include codec info — check base type too
        const baseMime = file.mimetype.split(';')[0].trim();
        if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_MIME_TYPES.has(baseMime)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    },
});
function createRecognizeRouter(provider) {
    const router = (0, express_1.Router)();
    router.post('/', (req, res, next) => {
        upload.single('audio')(req, res, (err) => {
            if (err) {
                if (err instanceof multer_1.default.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        res.status(413).json({
                            status: 'error',
                            result: null,
                            message: `Audio file too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
                        });
                        return;
                    }
                }
                res.status(400).json({
                    status: 'error',
                    result: null,
                    message: err.message || 'Invalid audio upload.',
                });
                return;
            }
            next();
        });
    });
    router.post('/', async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({
                    status: 'error',
                    result: null,
                    message: 'No audio file provided.',
                });
                return;
            }
            const result = await provider.recognize(file.buffer, file.mimetype);
            const statusCode = result.status === 'error' ? 502 : 200;
            res.status(statusCode).json(result);
        }
        catch (error) {
            console.error('Recognition error:', error instanceof Error ? error.message : error);
            res.status(500).json({
                status: 'error',
                result: null,
                message: 'An unexpected error occurred. Please try again.',
            });
        }
    });
    return router;
}
//# sourceMappingURL=recognize.js.map