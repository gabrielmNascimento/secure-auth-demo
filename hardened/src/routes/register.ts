import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db';
import { credentialsSchema } from '../validation';

const router = Router();
const BCRYPT_COST = 12;

router.post('/register', async (req: Request, res: Response) => {
  // Validate input shape and content
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid input',
      details: result.error.issues.map((i) => i.message),
    });
  }

  const { username, password } = result.data;

  try {
    // Check uniqueness with a parameterized query
    const existing = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (existing) {
      // Generic error — never confirm whether a username is taken
      return res.status(400).json({ error: 'Registration failed' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
      username,
      passwordHash
    );

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    // Generic error to client — never leak DB errors
    return res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
