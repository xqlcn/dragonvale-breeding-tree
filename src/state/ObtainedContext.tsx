import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { loadObtained, saveObtained } from "./obtainedStorage";

interface ObtainedState {
  /** Names of dragons the user has marked as obtained. */
  owned: ReadonlySet<string>;
  isOwned: (name: string) => boolean;
  toggle: (name: string) => void;
  clear: () => void;
}

const ObtainedContext = createContext<ObtainedState | null>(null);

/** Holds the "obtained" set shared by every view and persists it to localStorage. */
export function ObtainedProvider({ children }: { children: ReactNode }) {
  const [owned, setOwned] = useState<ReadonlySet<string>>(loadObtained);

  const update = useCallback((next: ReadonlySet<string>) => {
    saveObtained(next);
    setOwned(next);
  }, []);

  const toggle = useCallback((name: string) => {
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      saveObtained(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => update(new Set()), [update]);

  const value = useMemo<ObtainedState>(
    () => ({ owned, isOwned: (n) => owned.has(n), toggle, clear }),
    [owned, toggle, clear],
  );
  return <ObtainedContext.Provider value={value}>{children}</ObtainedContext.Provider>;
}

export function useObtained(): ObtainedState {
  const ctx = useContext(ObtainedContext);
  if (!ctx) throw new Error("useObtained must be used inside <ObtainedProvider>");
  return ctx;
}
