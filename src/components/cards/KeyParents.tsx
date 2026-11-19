import { useMemo } from "react";
import { sharedIngredients } from "../../lib/breeding";
import { labelOf } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { DragonSprite } from "../common/DragonSprite";
import { Icon } from "../common/Icon";

/**
 * Parents that appear in two or more of the list's trees, most-used first: the ones worth getting
 * early. Clicking one searches for it, showing only the dragons that need it; clicking again clears.
 */
export function KeyParents({ query, onPick }: { query: string; onPick: (q: string) => void }) {
  const { isOwned } = useObtained();
  const { targets } = useTargetList();
  const shared = useMemo(() => sharedIngredients(targets), [targets]);
  if (!shared.length) return null;
  const active = query.trim().toLowerCase();
  return (
    <section className="keyparents" id="shared" aria-label="Key parents">
      <h2>Key parents</h2>
      <div className="kp-list">
        {shared.map(({ name, usedInTargets }) => {
          const on = active === name.toLowerCase();
          return (
            <button
              key={name} type="button" data-name={name} aria-pressed={on}
              className={"kp" + (isOwned(name) ? " owned" : "")}
              title={`Needed for ${usedInTargets.map(labelOf).join(", ")}${on ? " (click to clear)" : " (click to show them)"}`}
              onClick={() => onPick(on ? "" : labelOf(name))}
            >
              <DragonSprite name={name} alt="" />
              <span className="kp-name">{labelOf(name)}</span>
              <span className="kp-count">{isOwned(name) ? <Icon name="check" size={12} strokeWidth={3} /> : `×${usedInTargets.length}`}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
