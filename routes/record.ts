import express, { Request, Response, Router } from 'express';
import { CanyonRecord } from '../src/types/CanyonRecord';

const session: any = require('express-session')
const recordRouter: Router = express.Router();

// Middleware to check if user is logged in
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (session && session.isloggedin) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}


// In-memory store for demonstration (replace with DB in production)
const canyonRecords: Array<CanyonRecord> = [];


recordRouter.post('/record', requireAuth, (req: Request, res: Response) => {
  const { name, date, url, teamSize, comments } = req.body as CanyonRecord;
  if (!name || !date) {
    return res.status(400).json({ error: 'Name and date are required.' });
  }
  const teamSizeNum = Number(teamSize);
  if (isNaN(teamSizeNum) || teamSizeNum < 1) {
    return res.status(400).json({ error: 'Team size must be a positive number.' });
  }
  canyonRecords.push({ name, date, url, teamSize: teamSizeNum, comments });
  res.status(201).json({ message: 'Canyon record added!', record: { name, date, url, teamSize: teamSizeNum, comments } });
});

recordRouter.get('/record', requireAuth, (req: Request, res: Response) => {
  res.json({ records: canyonRecords });
});

export default recordRouter;
