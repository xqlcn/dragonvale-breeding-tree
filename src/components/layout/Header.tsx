import { useState } from "react";
import { EVENT_NAME } from "../../config";
import { EVENT_DRAGONS } from "../../data/targets";
import { useTargetList } from "../../state/TargetListContext";
import type { ListScope } from "../../state/targetListStorage";
import { Icon } from "../common/Icon";
import { ListEditor } from "./ListEditor";

/** Event title, the My list / All dragons switch, and the bulk list editor. */
export function Header() {
  const { scope, setScope, favorites } = useTargetList();
  const [editing, setEditing] = useState(false);
  const options: { scope: ListScope; label: string; count: number }[] = [
    { scope: "favorites", label: "My list", count: favorites.length },
    { scope: "all", label: "All dragons", count: EVENT_DRAGONS.length },
  ];
  return (
    <header className="top">
      <div className="top-row">
        <div className="brand">
          <span className="logo"><Icon name="flake" size={22} /></span>
          <div>
            <h1>{EVENT_NAME}</h1>
            <p className="eyebrow">Breeding planner</p>
          </div>
        </div>
        <div className="top-actions">
          <div className="seg" id="scope" role="group" aria-label="Which dragons to plan">
            {options.map((o) => (
              <button key={o.scope} type="button" data-scope={o.scope} aria-pressed={scope === o.scope} onClick={() => setScope(o.scope)}>
                {o.label} <span className="count">{o.count}</span>
              </button>
            ))}
          </div>
          <button
            type="button" className="btn" id="editlist" aria-expanded={editing} aria-controls="leditor"
            onClick={() => setEditing((e) => !e)}
          >
            <Icon name="list" /> Edit list
          </button>
        </div>
      </div>
      {editing && <ListEditor onClose={() => setEditing(false)} />}
    </header>
  );
}
