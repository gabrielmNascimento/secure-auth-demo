import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: 'hardened' });
});

app.listen(PORT, () => {
  console.log(`✅ HARDENED server running on http://localhost:${PORT}`);
});
