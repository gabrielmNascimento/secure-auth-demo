import { Router, Request, Response } from 'express';
import db from '../db';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // THE classic SQL injection vulnerability.
  // Try logging in with username: admin' --
  // Or:                  username: ' OR '1'='1
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  try {
    const user: any = db.prepare(query).get();

    if (!user) {
      // First leak: confirms or denies whether the username exists
      const userCheck: any = db
        .prepare(`SELECT id FROM users WHERE username = '${username}'`)
        .get();

      if (userCheck) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a session — predictable, incremental ID. No expiry. No signing.
    const session: any = db
      .prepare('INSERT INTO sessions (user_id) VALUES (?)')
      .run(user.id);

    res.json({
      success: true,
      sessionId: session.lastInsertRowid,
      user: { id: user.id, username: user.username, password: user.password }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
