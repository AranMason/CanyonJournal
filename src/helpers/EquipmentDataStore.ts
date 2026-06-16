import { GearItem, GearServiceHistoryItem, RopeItem, RopeServiceHistoryItem } from '../types/types';
import { CanyonRecord } from '../types/CanyonRecord';
import { apiFetch } from '../utils/api';

export interface Equipment {
  gear: GearItem[];
  ropes: RopeItem[];
}

var loadPromise: Promise<Equipment> | null = null;

// Gear
var loadPromiseForGearServices: Record<number, Promise<GearServiceHistoryItem[]>> = {};
var loadPromiseForGearDescents: Record<number, Promise<CanyonRecord[]>> = {};
// Rope
var loadPromiseForRope: Record<number, Promise<RopeServiceHistoryItem[]>> = {};

export function loadGearHistory(gearId: number): Promise<GearServiceHistoryItem[]> {
  if (!loadPromiseForGearServices[gearId]) {
    loadPromiseForGearServices[gearId] = apiFetch<GearServiceHistoryItem[]>(`/api/equipment/gear/${gearId}/service`).catch(err => {
      delete loadPromiseForGearServices[gearId];
      throw err;
    });
  }
  return loadPromiseForGearServices[gearId];
}

export function loadGearDescents(gearId: number): Promise<CanyonRecord[]> {
  if (!loadPromiseForGearDescents[gearId]) {
    loadPromiseForGearDescents[gearId] = apiFetch<CanyonRecord[]>(`/api/equipment/gear/${gearId}/descents`).catch(err => {
      delete loadPromiseForGearDescents[gearId];
      throw err;
    });
  }
  return loadPromiseForGearDescents[gearId];
}

export function loadRopeHistory(ropeId: number): Promise<RopeServiceHistoryItem[]> {
  if (!loadPromiseForRope[ropeId]) {
    loadPromiseForRope[ropeId] = apiFetch<RopeServiceHistoryItem[]>(`/api/equipment/rope/${ropeId}/service`).catch(err => {
      delete loadPromiseForRope[ropeId];
      throw err;
    });
  }
  return loadPromiseForRope[ropeId];
}


export function load(): Promise<Equipment> {
  loadPromise ??= apiFetch<Equipment>('/api/equipment').catch(err => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

export function invalidate(): void {
  loadPromise = null;
  loadPromiseForGearServices = {};
  loadPromiseForGearDescents = {};
}
