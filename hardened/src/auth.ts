import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters');
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: '15m',
    issuer: 'secure-auth-demo',
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string, {
    issuer: 'secure-auth-demo',
  }) as JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (err) {
    // Generic error — never tell the attacker WHY the token failed
    return res.status(401).json({ error: 'Authentication required' });
  }
}
