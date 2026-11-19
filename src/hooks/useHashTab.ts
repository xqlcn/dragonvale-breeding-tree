import { useCallback, useState } from "react";

export type TabId = "trees" | "table" | "graph";

const fromHash = (): TabId => (location.hash === "#graph" ? "graph" : location.hash === "#table" ? "table" : "trees");

/** Active view, mirrored to the URL: "#table" / "#graph", no hash for the default Trees view. */
export function useHashTab(): [TabId, (tab: TabId) => void] {
  const [tab, setTabState] = useState<TabId>(fromHash);
  const setTab = useCallback((t: TabId) => {
    setTabState(t);
    history.replaceState(null, "", t === "trees" ? location.pathname + location.search : `#${t}`);
  }, []);
  return [tab, setTab];
}
