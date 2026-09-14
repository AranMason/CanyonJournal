import {
  GearItem,
  GearItemSet,
  GearServiceHistoryItem,
  RopeItem,
  RopeServiceHistoryItem
} from '../../types/types';
import { CanyonRecord } from '../../types/CanyonRecord';
import { PromiseCache } from '../caches/PromiseCache';
import { MultiPromiseCache } from '../caches/MultiPromiseCache';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../utils/api';

export interface Equipment {
  gear: GearItem[];
  ropes: RopeItem[];
}

/* -----------------------------
   Single-value cache: Equipment
------------------------------ */

const equipmentCache = new PromiseCache<Equipment>(() =>
  apiGet<Equipment>('/api/equipment')
);

export function load(): Promise<Equipment> {
  return equipmentCache.get();
}

/* -----------------------------
   Multi-key caches: Gear
------------------------------ */

const gearServiceCache = new MultiPromiseCache<number, GearServiceHistoryItem[]>(gearId =>
  apiGet<GearServiceHistoryItem[]>(`/api/equipment/gear/${gearId}/service`)
);

const gearDescentsCache = new MultiPromiseCache<number, CanyonRecord[]>(gearId =>
  apiGet<CanyonRecord[]>(`/api/equipment/gear/${gearId}/descents`)
);

export function loadGearHistory(gearId: number): Promise<GearServiceHistoryItem[]> {
  return gearServiceCache.get(gearId);
}

export function loadGearDescents(gearId: number): Promise<CanyonRecord[]> {
  return gearDescentsCache.get(gearId);
}

/* -----------------------------
   Multi-key caches: Rope
------------------------------ */

const ropeServiceCache = new MultiPromiseCache<number, RopeServiceHistoryItem[]>(ropeId =>
  apiGet<RopeServiceHistoryItem[]>(`/api/equipment/rope/${ropeId}/service`)
);

const ropeDescentsCache = new MultiPromiseCache<number, CanyonRecord[]>(ropeId =>
  apiGet<CanyonRecord[]>(`/api/equipment/rope/${ropeId}/descents`)
);

export function loadRopeHistory(ropeId: number): Promise<RopeServiceHistoryItem[]> {
  return ropeServiceCache.get(ropeId);
}

export function loadRopeDescents(ropeId: number): Promise<CanyonRecord[]> {
  return ropeDescentsCache.get(ropeId);
}

/* -----------------------------
   Single-value cache: Gear Sets
------------------------------ */

const gearSetsCache = new PromiseCache<GearItemSet[]>(() =>
  apiGet<GearItemSet[]>('/api/equipment/gear/sets')
);

export function loadGearSets(): Promise<GearItemSet[]> {
  return gearSetsCache.get();
}

export function invalidateGearSets(): void {
  gearSetsCache.reset();
}

/* -----------------------------
   Invalidation
------------------------------ */

export function invalidate(): void {
  equipmentCache.reset();
  gearServiceCache.reset();
  gearDescentsCache.reset();
  ropeServiceCache.reset();
  ropeDescentsCache.reset();
  gearSetsCache.reset();
}

/* -----------------------------
   Mutations
------------------------------ */

export function addRope(rope: RopeItem): Promise<void> {
  return apiPost<void, RopeItem>('/api/equipment/rope', rope);
}

export function addGear(gear: GearItem): Promise<void> {
  return apiPost<void, GearItem>('/api/equipment/gear', gear);
}

export function updateGearSet(gearSet: GearItemSet): Promise<void> {
  return apiPatch<void, GearItemSet>(`/api/equipment/gear/sets/${gearSet.Id}`, gearSet);
}

export function createGearSet(gearSet: GearItemSet): Promise<void> {
  return apiPost<void, GearItemSet>('/api/equipment/gear/sets', gearSet);
}

export function deleteGearSet(gearSetId: number): Promise<void> {
  return apiDelete<void>(`/api/equipment/gear/sets/${gearSetId}`);
}
