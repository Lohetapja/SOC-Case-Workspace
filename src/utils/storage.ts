/**
 * Tiny typed wrapper around `localStorage`. Keeps the storage mechanism behind a
 * small abstraction (per ADR-0003) so it can be swapped later, and fails safe if
 * storage is unavailable or holds malformed JSON.
 */

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Unavailable storage or invalid JSON — fall back rather than crash.
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore write failures (e.g. storage full or disabled).
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore.
  }
}
