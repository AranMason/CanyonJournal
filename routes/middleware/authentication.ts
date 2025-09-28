import { Request, Response, NextFunction } from "express";
import type {} from '../../src/types/express-session'

// Middleware to check if user is logged in
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.isloggedin) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}