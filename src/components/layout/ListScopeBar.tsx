import { EVENT_DRAGONS } from "../../data/targets";
import { useTargetList } from "../../state/TargetListContext";
import type { ListScope } from "../../state/targetListStorage";

const OPTIONS: { scope: ListScope; label: string }[] = [
  { scope: "favorites", label: "⭐ My list" },
  { scope: "all", label: "All event dragons" },
];

/** Switches every view between "My list" and all event dragons. */
export function ListScopeBar() {
  const { scope, setScope, favorites, resetFavorites } = useTargetList();
  const counts: Record<ListScope, number> = { favorites: favorites.length, all: EVENT_DRAGONS.length };
  const reset = () => {
    if (confirm("Reset My list to the original 23 dragons?")) resetFavorites();
  };
  return (
    <div className="scope" id="scope">
      <div className="seg" role="group" aria-label="Which dragons to show">
        {OPTIONS.map((o) => (
          <button key={o.scope} type="button" data-scope={o.scope} aria-pressed={scope === o.scope} onClick={() => setScope(o.scope)}>
            {o.label} <span className="count">{counts[o.scope]}</span>
          </button>
        ))}
      </div>
      <p className="hint">
        {scope === "favorites"
          ? <>Showing only your list. Press <b style={{ color: "var(--warn)" }}>★</b> on a card to remove it; switch to All event dragons to add more.</>
          : <>Showing every event dragon. Press <b style={{ color: "var(--warn)" }}>☆</b> on a card to add it to your list.</>}
        {" "}<button type="button" className="linkbtn" id="resetfav" onClick={reset}>Reset my list</button>
      </p>
    </div>
  );
}
