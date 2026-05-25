import express from 'express';
import registerRoute from './routes/register';
import loginRoute from './routes/login';
import profileRoute from './routes/profile';
import './db'; // initializes the database

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: 'vulnerable' });
});

app.use(registerRoute);
app.use(loginRoute);
app.use(profileRoute);

app.listen(PORT, () => {
  console.log(`⚠️  VULNERABLE server running on http://localhost:${PORT}`);
  console.log(`⚠️  This is a deliberately insecure demo. DO NOT use in production.`);
});
