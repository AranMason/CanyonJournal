import { Router, Response, Request } from 'express';
import { GearItem, RopeItem } from '../src/types/types';
import { requireAuth } from './middleware/authentication';

// Extend express-session types to include custom properties
declare module 'express-session' {
  interface SessionData {
    gear?: GearItem[];
    ropes?: RopeItem[];
    gearId?: number;
    ropeId?: number;
  }
}

const router = Router();
// Removed unused session import, using req.session instead

function ensureGearSession(req: Request) {
  if (!req.session.gear) req.session.gear = [];
  if (!req.session.ropes) req.session.ropes = [];
  if (!req.session.gearId) req.session.gearId = 1;
  if (!req.session.ropeId) req.session.ropeId = 1;
}

// Get all gear and ropes
router.get('/',  requireAuth, (req: Request, res: Response) => {
  ensureGearSession(req);
  res.json({ gear: req.session.gear, ropes: req.session.ropes });
});

// Add gear
router.post('/gear',  requireAuth, (req: Request, res: Response) => {
  ensureGearSession(req);
  const now = new Date().toISOString();
  const id = (req.session as any).gearId++;
  const item: GearItem = {
    ...req.body,
    id,
    created: now,
    updated: now,
  };
  req.session.gear!.push(item);
  res.status(201).json(item);
});

// Edit gear
router.put('/gear/:id',  requireAuth, (req: Request, res: Response) => {
  ensureGearSession(req);
  const id = Number(req.params.id);
  const idx = req.session.gear!.findIndex((g: GearItem) => g.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  req.session.gear![idx] = { ...req.body, id, created: req.session.gear![idx].created, updated: now };
  res.json(req.session.gear![idx]);
});

// Delete gear
router.delete('/gear/:id',  requireAuth, (req: Request, res: Response) => {
  ensureGearSession(req);
  const id = Number(req.params.id);
  req.session.gear = req.session.gear!.filter((g: GearItem) => g.id !== id);
  res.status(204).end();
});

// Add rope
router.post('/rope', requireAuth,  (req: Request, res: Response) => {
  ensureGearSession(req);
  const now = new Date().toISOString();
  const id = (req.session as any).ropeId++;
  const item: RopeItem = {
    ...req.body,
    id,
    created: now,
    updated: now,
  };
  req.session.ropes!.push(item);
  res.status(201).json(item);
});

// Edit rope
router.put('/rope/:id',  requireAuth, (req: Request, res: Response) => {
  ensureGearSession(req);
  const id = Number(req.params.id);
  const idx = req.session.ropes!.findIndex((r: RopeItem) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  req.session.ropes![idx] = { ...req.body, id, created: req.session.ropes![idx].created, updated: now };
  res.json(req.session.ropes![idx]);
});

// Delete rope
router.delete('/rope/:id', requireAuth,  (req: Request, res: Response) => {
  ensureGearSession(req);
  const id = Number(req.params.id);
  req.session.ropes = req.session.ropes!.filter((r: RopeItem) => r.id !== id);
  res.status(204).end();
});

export default router;
