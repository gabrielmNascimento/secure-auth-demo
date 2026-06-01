import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { globalLimiter, authLimiter } from './rateLimit';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import profileRoute from './routes/profile';
import './db';

const app = express();
const PORT = 3001;

// Security headers via Helmet — CSP, X-Frame-Options, HSTS, and ~12 more
app.use(helmet());

// Capped JSON body size — prevents memory-exhaustion DoS
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Trust the first proxy if running behind one (so req.ip is the real client)
app.set('trust proxy', 1);

// Global rate limit on everything
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: 'hardened' });
});

// Stricter rate limit on auth endpoints specifically
app.use('/login', authLimiter);
app.use('/register', authLimiter);

app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute);

// Catch-all error handler — never leak stack traces to clients
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ HARDENED server running on http://localhost:${PORT}`);
});
