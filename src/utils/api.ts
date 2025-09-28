import { clearUser } from './user';

// Shared API helper for fetch logic
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (response.status === 401) {
    clearUser();
    window.location.assign('/');
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    let errorMsg = 'API error';
    try {
      const err = await response.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
