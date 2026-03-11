/**
 * Lightweight sessionStorage cache with TTL.
 * Data lives for the browser session and expires after TTL_MS.
 * Safe when sessionStorage is unavailable (private mode, quota exceeded).
 */

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded or unavailable — silently skip
  }
}

export function cacheClear(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
