import { apiFetch } from '../utils/api';

export interface FavouriteEntry {
  CanyonId: number | null;
  UserCanyonId: number | null;
}

var loadPromise: Promise<FavouriteEntry[]> | null = null;

export function load(): Promise<FavouriteEntry[]> {
  loadPromise ??= apiFetch<FavouriteEntry[]>('/api/favourites').catch(err => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

export function invalidate(): void {
  loadPromise = null;
}
