import { GearItem, RopeItem } from '../types/types';
import { apiFetch } from '../utils/api';

export interface Equipment {
  gear: GearItem[];
  ropes: RopeItem[];
}

var loadPromise: Promise<Equipment> | null = null;

export function load(): Promise<Equipment> {
  loadPromise ??= apiFetch<Equipment>('/api/equipment').catch(err => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

export function invalidate(): void {
  loadPromise = null;
}
