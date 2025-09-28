import { User } from '../types/types';

export type SetUserFn = (u: User | null) => void;

export let setUserRef: SetUserFn | null = null;

export function registerSetUser(fn: SetUserFn) {
  setUserRef = fn;
}

export function clearUser() {
  if (setUserRef) setUserRef(null);
}
