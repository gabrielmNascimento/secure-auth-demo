import { Router, Request, Response } from 'express';
import db from '../db';
import { requireAuth } from '../auth';

const router = Router();

router.get('/profile', requireAuth, (req: Request, res: Response) => {
  const { userId } = (req as any).user;

  // Parameterized query, and we explicitly select only safe columns —
  // never `SELECT *` on a users table. The password_hash should never
  // leave the server.
  const user: any = db
    .prepare('SELECT id, username, created_at FROM users WHERE id = ?')
    .get(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

export default router;
