import { Router, Response, Request } from 'express';
import { GearItem, RopeItem } from '../src/types/types';

// SessionData is extended in src/types/express-session.d.ts

const router = Router();
const session: any = require('express-session')

function ensureGearSession() {
  if (!session.gear) session.gear = [];
  if (!session.ropes) session.ropes = [];
  if (!session.gearId) session.gearId = 1;
  if (!session.ropeId) session.ropeId = 1;
}

// Get all gear and ropes
router.get('/', (req: Request, res: Response) => {
  ensureGearSession(req);
  res.json({ gear: session.gear, ropes: session.ropes });
});

// Add gear
router.post('/gear', (req: Request, res: Response) => {
  ensureGearSession();
  const now = new Date().toISOString();
  const id = (req.session as any).gearId++;
  const item: GearItem = {
    ...req.body,
    id,
    created: now,
    updated: now,
  };
  session.gear.push(item);
  res.status(201).json(item);
});

// Edit gear
router.put('/gear/:id', (req: Request, res: Response) => {
  ensureGearSession();
  const id = Number(req.params.id);
  const idx = session.gear.findIndex((g: GearItem) => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  session.gear[idx] = { ...req.body, id, created: session.gear[idx].created, updated: now };
  res.json(session.gear[idx]);
});

// Delete gear
router.delete('/gear/:id', (req: Request, res: Response) => {
  ensureGearSession();
  const id = Number(req.params.id);
  session.gear = session.gear.filter((g: GearItem) => g.id !== id);
  res.status(204).end();
});

// Add rope
router.post('/rope', (req: Request, res: Response) => {
  ensureGearSession();
  const now = new Date().toISOString();
  const id = (req.session as any).ropeId++;
  const item: RopeItem = {
    ...req.body,
    id,
    created: now,
    updated: now,
  };
  session.ropes.push(item);
  res.status(201).json(item);
});

// Edit rope
router.put('/rope/:id', (req: Request, res: Response) => {
  ensureGearSession();
  const id = Number(req.params.id);
  const idx = session.ropes.findIndex((r: RopeItem) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  session.ropes[idx] = { ...req.body, id, created: session.ropes[idx].created, updated: now };
  res.json(session.ropes[idx]);
});

// Delete rope
router.delete('/rope/:id', (req: Request, res: Response) => {
  ensureGearSession();
  const id = Number(req.params.id);
  session.ropes = session.ropes.filter((r: RopeItem) => r.id !== id);
  res.status(204).end();
});

export default router;
