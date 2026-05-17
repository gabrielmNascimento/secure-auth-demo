import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: 'vulnerable' });
});

app.listen(PORT, () => {
  console.log(`⚠️  VULNERABLE server running on http://localhost:${PORT}`);
  console.log(`⚠️  DO NOT use this in production. This is a demo.`);
});
