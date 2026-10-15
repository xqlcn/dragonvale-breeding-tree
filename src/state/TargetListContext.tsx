import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../data/targets";
import { loadFavorites, loadListScope, saveFavorites, saveListScope, type ListScope } from "./targetListStorage";

interface TargetListState {
  /** Which list is shown. */
  scope: ListScope;
  setScope: (scope: ListScope) => void;
  /** "My list", in the order dragons were added. */
  favorites: readonly string[];
  isFavorite: (name: string) => boolean;
  /** Adds the dragon to the end of "My list", or removes it. */
  toggleFavorite: (name: string) => void;
  /** Restores the original 23-dragon list. */
  resetFavorites: () => void;
  /** The active targets: "My list" or every event dragon. Drives cards, prices, stats and the graph. */
  targets: readonly string[];
}

const TargetListContext = createContext<TargetListState | null>(null);

/** Holds "My list" and the list switch, persisted to localStorage. */
export function TargetListProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<readonly string[]>(loadFavorites);
  const [scope, setScopeState] = useState<ListScope>(loadListScope);

  const setScope = useCallback((next: ListScope) => {
    saveListScope(next);
    setScopeState(next);
  }, []);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
      saveFavorites(next);
      return next;
    });
  }, []);

  const resetFavorites = useCallback(() => {
    const next = DEFAULT_FAVORITES.slice();
    saveFavorites(next);
    setFavorites(next);
  }, []);

  const value = useMemo<TargetListState>(() => {
    const favSet = new Set(favorites);
    return {
      scope, setScope, favorites, toggleFavorite, resetFavorites,
      isFavorite: (n) => favSet.has(n),
      targets: scope === "all" ? EVENT_DRAGONS : favorites,
    };
  }, [scope, setScope, favorites, toggleFavorite, resetFavorites]);
  return <TargetListContext.Provider value={value}>{children}</TargetListContext.Provider>;
}

export function useTargetList(): TargetListState {
  const ctx = useContext(TargetListContext);
  if (!ctx) throw new Error("useTargetList must be used inside <TargetListProvider>");
  return ctx;
}
