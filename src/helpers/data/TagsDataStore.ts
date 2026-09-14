import { apiFetch } from '../../utils/api';
import { PromiseCache } from '../caches/PromiseCache';

export interface Tag {
  Id: number;
  Name: string;
  UsageCount?: number;
  LastUsed?: string | null;
}

// Create a cache instance for loading tags
const tagCache = new PromiseCache<Tag[]>(() =>
  apiFetch<Tag[]>('/api/tags')
);

export function load(): Promise<Tag[]> {
  return tagCache.get();
}

export function invalidate(): void {
  tagCache.reset();
}

export async function create(name: string): Promise<Tag> {
  const tag = await apiFetch<Tag>('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Name: name }),
  });

  // Invalidate so next load() fetches fresh data
  invalidate();

  return tag;
}
