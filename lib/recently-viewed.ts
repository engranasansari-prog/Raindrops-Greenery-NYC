// SSR-safe localStorage helper backing the menu's "Recently viewed" strip.
// Every read/write is guarded so server renders and blocked storage
// (private mode, quota) degrade to a silent no-op instead of crashing.

const KEY = 'rd-recently-viewed';
const MAX = 8;

/** Stored product ids, newest first (max 8). Returns [] on the server or on any storage error. */
export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that isn't a string in case the key was hand-edited.
    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX);
  } catch {
    return [];
  }
}

/** Move `id` to the front (deduped), capped at 8. No-op on the server or on storage errors. */
export function recordView(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const next = [id, ...getRecentlyViewed().filter((existing) => existing !== id)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Ignore — recently-viewed is a nicety, never worth surfacing an error.
  }
}
