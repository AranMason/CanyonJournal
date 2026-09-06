import { Goal } from '../types/Goal';
import { apiFetch } from '../utils/api';

// TODO: This is additive, so we're loading the same information twice.
const loadPromises = new Map<boolean, Promise<Goal[]>>();

export function load(includeCompleted = false): Promise<Goal[]> {
  const cached = loadPromises.get(includeCompleted);
  if (cached) return cached;

  const query = includeCompleted ? '?includeCompleted=true' : '';
  const request = apiFetch<Goal[]>(`/api/goals${query}`).catch(error => {
    loadPromises.delete(includeCompleted);
    throw error;
  });

  loadPromises.set(includeCompleted, request);
  return request;
}

export function invalidate(): void {
  loadPromises.clear();
}