import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // No validation. No length check. No password complexity. Nothing.
  // Raw string concatenation — SQL injection waiting to happen.
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;

  try {
    db.exec(query);
    res.json({ success: true, message: `User ${username} registered` });
  } catch (err: any) {
    // Leaks database error details to the client
    res.status(500).json({ error: err.message });
  }
});

export default router;
