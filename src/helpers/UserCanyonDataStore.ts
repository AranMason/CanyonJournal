import { UserCanyon, UserCanyonWithDescents } from '../types/UserCanyon';
import { apiFetch } from '../utils/api';

var loadPromise: Promise<UserCanyonWithDescents[]> | null = null;

export function load(): Promise<UserCanyonWithDescents[]> {
  loadPromise ??= apiFetch<UserCanyonWithDescents[]>('/api/user-canyons').catch(err => {
    loadPromise = null;
    throw err;
  });
  return loadPromise;
}

export async function loadById(): Promise<{ [id: number]: UserCanyon }> {
  const items = await load();
  const dict: { [id: number]: UserCanyon } = {};
  items.forEach(uc => { dict[uc.Id] = uc; });
  return dict;
}

export function invalidate(): void {
  loadPromise = null;
}
