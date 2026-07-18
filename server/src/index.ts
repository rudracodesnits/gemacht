import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProvider } from './providers/index.js';
import { createRecognizeRouter } from './routes/recognize.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const CLIENT_ORIGIN = process.env['CLIENT_ORIGIN'] ?? 'http://localhost:5173';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS — only allow the configured client origin
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// Rate limiting on recognition endpoint
const recognizeLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 15,               // 15 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    result: null,
    message: 'Too many recognition requests. Please wait a moment and try again.',
  },
});

// Create recognition provider
const provider = createProvider();
console.log(`Using recognition provider: ${provider.name}`);

// Routes
app.use('/api/recognize', recognizeLimiter, createRecognizeRouter(provider));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: provider.name });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gemacht server running on http://localhost:${PORT}`);
});

export { app };
