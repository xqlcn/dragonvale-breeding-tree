import { FAVORITES_STORAGE_KEY, LIST_SCOPE_STORAGE_KEY } from "../config";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../data/targets";

/** Which list drives the cards, prices, stats and graph. */
export type ListScope = "favorites" | "all";

/**
 * Reads "My list". Falls back to `DEFAULT_FAVORITES` when nothing was saved yet (or storage is
 * blocked / corrupt). Unknown or duplicate names are dropped. Never throws.
 */
export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === null) return DEFAULT_FAVORITES.slice();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_FAVORITES.slice();
    return [...new Set(parsed.filter((x): x is string => typeof x === "string" && EVENT_DRAGONS.includes(x)))];
  } catch {
    return DEFAULT_FAVORITES.slice();
  }
}

export function saveFavorites(favorites: readonly string[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    /* storage unavailable: the list just isn't persisted */
  }
}

export function loadListScope(): ListScope {
  try {
    return localStorage.getItem(LIST_SCOPE_STORAGE_KEY) === "all" ? "all" : "favorites";
  } catch {
    return "favorites";
  }
}

export function saveListScope(scope: ListScope): void {
  try {
    localStorage.setItem(LIST_SCOPE_STORAGE_KEY, scope);
  } catch {
    /* storage unavailable */
  }
}
