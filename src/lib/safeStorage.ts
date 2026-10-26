import type { PersistStorage, StateStorage } from 'zustand/middleware';

const listeners = new Set<() => void>();
let unavailable = false;
function reportUnavailable() {
  if (unavailable) return;
  unavailable = true;
  listeners.forEach(listener => listener());
}
export const storageStatus = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  getSnapshot: () => unavailable,
  getServerSnapshot: () => false,
};

/** Probe only our own temporary key; never touch saved progress. */
export function checkStorageAvailability() {
  const key = `lettoria-storage-check-${Date.now()}-${Math.random()}`;
  try {
    localStorage.setItem(key, key);
    const saved = localStorage.getItem(key);
    localStorage.removeItem(key);
    if (saved !== key) reportUnavailable();
  } catch { reportUnavailable(); }
}

/** Keep the existing Zustand format and keys. A denied write must not interrupt a lesson.
 * After a failure keep this store in memory until reload, rather than reading stale disk data.
 * Never delete or overwrite unreadable saved progress.
 */
export function createSafeStorage<T>(
  getStorage: () => StateStorage | undefined = () => typeof localStorage === 'undefined' ? undefined : localStorage,
  onFailure: () => void = reportUnavailable,
): PersistStorage<T> {
  const memory = new Map<string, { state: T; version?: number }>();
  let failed = false;
  function fail() { failed = true; onFailure(); }
  return {
    getItem(name) {
      if (failed) return memory.get(name) ?? null;
      try {
        const storage = getStorage();
        if (!storage) {
          if (typeof window !== 'undefined') fail();
          return null;
        }
        const value = storage.getItem(name);
        // Lettoria uses synchronous browser localStorage only.
        if (typeof value !== 'string') return null;
        const parsed = JSON.parse(value);
        memory.set(name, parsed);
        return parsed;
      } catch { fail(); return memory.get(name) ?? null; }
    },
    setItem(name, value) {
      memory.set(name, value);
      if (failed) return;
      try {
        const storage = getStorage();
        if (storage) storage.setItem(name, JSON.stringify(value));
        else if (typeof window !== 'undefined') fail();
      } catch { fail(); }
    },
    removeItem(name) {
      memory.delete(name);
      if (failed) return;
      try { getStorage()?.removeItem(name); } catch { fail(); }
    },
  };
}
