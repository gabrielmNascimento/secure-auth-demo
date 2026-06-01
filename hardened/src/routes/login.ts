import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../db';
import { credentialsSchema } from '../validation';
import { signToken } from '../auth';

const router = Router();

// A fake bcrypt hash to compare against when username doesn't exist.
// This keeps response time constant whether the user exists or not,
// preventing timing-based username enumeration.
const DUMMY_HASH = '$2b$12$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQR';

router.post('/login', async (req: Request, res: Response) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const { username, password } = result.data;
  const ip = req.ip ?? 'unknown';

  try {
    const user: any = db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get(username);

    // Always run bcrypt.compare to keep timing constant.
    // If user doesn't exist, compare against a dummy hash so the response
    // takes the same time as a real failed login.
    const hashToCheck = user?.password_hash ?? DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    // Audit log — record every attempt regardless of outcome
    db.prepare(
      'INSERT INTO login_attempts (username, ip_address, success) VALUES (?, ?, ?)'
    ).run(username, ip, user && passwordMatches ? 1 : 0);

    if (!user || !passwordMatches) {
      // Single generic error for ALL failures — no username enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, username: user.username });

    // httpOnly cookie — JavaScript on the page can't read it,
    // so XSS attacks can't steal the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // matches JWT expiry
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
