import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.get('/profile', (req: Request, res: Response) => {
  // Session ID comes from a custom header. No expiry, no validation.
  // Anyone can guess sequential IDs: 1, 2, 3...
  const sessionId = req.header('X-Session-Id');

  if (!sessionId) {
    return res.status(401).json({ error: 'No session ID provided' });
  }

  const session: any = db
    .prepare(`SELECT * FROM sessions WHERE id = ${sessionId}`)
    .get();

  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const user: any = db.prepare(`SELECT * FROM users WHERE id = ${session.user_id}`).get();

  res.json({ user });
});

export default router;
