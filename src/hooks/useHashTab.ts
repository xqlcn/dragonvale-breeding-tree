import { useCallback, useState } from "react";

export type TabId = "cards" | "graph";

/** Active tab, mirrored to the URL: "#graph" for the graph tab, no hash for the default tab. */
export function useHashTab(): [TabId, (tab: TabId) => void] {
  const [tab, setTabState] = useState<TabId>(() => (location.hash === "#graph" ? "graph" : "cards"));
  const setTab = useCallback((t: TabId) => {
    setTabState(t);
    history.replaceState(null, "", t === "graph" ? "#graph" : location.pathname + location.search);
  }, []);
  return [tab, setTab];
}
