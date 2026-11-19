import { useState } from "react";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../../data/targets";
import { useTargetList } from "../../state/TargetListContext";
import type { ListScope } from "../../state/targetListStorage";
import { ListEditor } from "./ListEditor";

const OPTIONS: { scope: ListScope; label: string }[] = [
  { scope: "favorites", label: "⭐ My list" },
  { scope: "all", label: "All event dragons" },
];

/** Switches every view between "My list" and all event dragons, and opens the bulk list editor. */
export function ListScopeBar() {
  const { scope, setScope, favorites, resetFavorites } = useTargetList();
  const [editing, setEditing] = useState(false);
  const counts: Record<ListScope, number> = { favorites: favorites.length, all: EVENT_DRAGONS.length };
  const reset = () => {
    if (confirm(`Reset My list to the default ${DEFAULT_FAVORITES.length} dragons?`)) resetFavorites();
  };
  return (
    <>
      <div className="scope" id="scope">
        <div className="seg" role="group" aria-label="Which dragons to show">
          {OPTIONS.map((o) => (
            <button key={o.scope} type="button" data-scope={o.scope} aria-pressed={scope === o.scope} onClick={() => setScope(o.scope)}>
              {o.label} <span className="count">{counts[o.scope]}</span>
            </button>
          ))}
        </div>
        <button
          type="button" className="editbtn" id="editlist" aria-expanded={editing} aria-controls="leditor"
          onClick={() => setEditing((e) => !e)}
        >
          ☑ {editing ? "Close list editor" : "Edit my list"}
        </button>
        <p className="hint">
          {scope === "favorites"
            ? <>Showing only your list. Press <b style={{ color: "var(--warn)" }}>★</b> on a card to remove it, or use Edit my list to tick many at once.</>
            : <>Showing every event dragon. Press <b style={{ color: "var(--warn)" }}>☆</b> on a card to add it to your list.</>}
          {" "}<button type="button" className="linkbtn" id="resetfav" onClick={reset}>Reset my list</button>
        </p>
      </div>
      {editing && <ListEditor onClose={() => setEditing(false)} />}
    </>
  );
}
