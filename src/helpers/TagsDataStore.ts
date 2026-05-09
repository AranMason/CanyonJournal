import { apiFetch } from '../utils/api';

export interface Tag {
  Id: number;
  Name: string;
  UsageCount?: number;
  LastUsed?: string | null;
}

var loadPromise: Promise<Tag[]> | null = null;

export function load(): Promise<Tag[]> {
  loadPromise ??= apiFetch<Tag[]>('/api/tags').catch(err => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

export function invalidate(): void {
  loadPromise = null;
}
