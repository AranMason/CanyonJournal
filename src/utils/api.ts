import { clearUser } from './user';

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('Network error');
  }

  if (response.status === 401) {
    clearUser();
    window.location.assign('/');
    throw new Error('Unauthorized');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    let errorMsg = 'API error';
    try {
      const err = await response.json();
      errorMsg = err.error || errorMsg;
    } catch (_ignored) { }
    throw new Error(errorMsg);
  }

  return response.json();
}

/* -----------------------------
   GET
------------------------------ */

export function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'GET' });
}

/* -----------------------------
   POST (typed body)
------------------------------ */

// Overload: POST with no body
export function apiPost<T>(url: string): Promise<T>;

// Overload: POST with typed body
export function apiPost<T, B>(url: string, body: B): Promise<T>;

// Implementation
export function apiPost<T, B>(url: string, body?: B): Promise<T> {
  return apiFetch<T>(url, {
    method: 'POST',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

/* -----------------------------
   PATCH (typed body)
------------------------------ */

export function apiPatch<T>(url: string): Promise<T>;
export function apiPatch<T, B>(url: string, body: B): Promise<T>;

export function apiPatch<T, B>(url: string, body?: B): Promise<T> {
  return apiFetch<T>(url, {
    method: 'PATCH',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
}

/* -----------------------------
   DELETE
------------------------------ */

export function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'DELETE' });
}
