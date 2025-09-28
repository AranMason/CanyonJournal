import express, { Request, Response, Router } from 'express';
import { CanyonRecord } from '../src/types/CanyonRecord';
import { requireAuth } from './middleware/authentication';

const recordRouter: Router = express.Router();


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
  const timestamp = new Date().toISOString();
  const record: CanyonRecord = { name, date, url, teamSize: teamSizeNum, comments, timestamp };
  canyonRecords.push(record);
  res.status(201).json({ message: 'Canyon record added!', record });
});

recordRouter.get('/record', requireAuth, (req: Request, res: Response) => {
  // Sort by timestamp descending (most recent first)
  const sorted = [...canyonRecords].sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return b.timestamp.localeCompare(a.timestamp);
  });
  res.json({ records: sorted });
});

export default recordRouter;
