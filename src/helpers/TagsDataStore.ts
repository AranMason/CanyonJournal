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

export async function create(name: string): Promise<Tag> {
  const tag = await apiFetch<Tag>('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Name: name }),
  });
  invalidate();
  return tag;
}
