import { useState } from "react";
import { DRAGONS } from "../../data/dragons";
import { requirementsOf } from "../../lib/breeding";
import { howToObtainText, isDragonItem, labelOf, parseIngredient, type Ingredient } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { BreedTime } from "../common/BreedTime";
import { DragonSprite } from "../common/DragonSprite";
import { ElementFlag } from "../common/ElementFlag";
import { Icon } from "../common/Icon";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";

/** Breeding tree for one dragon: its parents, each expandable into their own parents. */
export const BreedingTree = ({ name }: { name: string }) => <TreeLevel name={name} />;

/** One level: a row per specific parent, then one row for any element / epic requirements. */
function TreeLevel({ name }: { name: string }) {
  const reqs = requirementsOf(name);
  const parents = reqs.filter(isDragonItem);
  const elements = reqs.map(parseIngredient).filter((i): i is Exclude<Ingredient, { kind: "dragon" }> => i.kind !== "dragon");
  return (
    <ul className="tree">
      {parents.map((p, i) => <ParentItem key={`${p}-${i}`} name={p} />)}
      {elements.length > 0 && (
        <li className="req-row"><Requirements items={elements} withParents={parents.length > 0} /></li>
      )}
    </ul>
  );
}

function ParentItem({ name }: { name: string }) {
  const { isOwned } = useObtained();
  const owned = isOwned(name);
  const expandable = requirementsOf(name).length > 0;
  const [open, setOpen] = useState(false);
  // Collapse when this dragon becomes obtained (adjusting state during render, React's alternative to an effect).
  const [prevOwned, setPrevOwned] = useState(owned);
  if (owned !== prevOwned) {
    setPrevOwned(owned);
    if (owned) setOpen(false);
  }

  const className = owned ? "owned" : undefined;
  if (!expandable) return <li data-name={name} className={className}><ParentRow name={name} expandable={false} /></li>;
  return (
    <li data-name={name} className={className}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary><ParentRow name={name} expandable /></summary>
        {open && <TreeLevel name={name} />}
      </details>
    </li>
  );
}

/** Chevron, obtained check, picture, name with its own recipe, then price and breeding time. */
function ParentRow({ name, expandable }: { name: string; expandable: boolean }) {
  const d = DRAGONS[name] ?? {};
  const how = d.evolvesFrom ? `Evolves from ${labelOf(d.evolvesFrom)}` : howToObtainText(name);
  return (
    <div className="node">
      <span className="chev">{expandable && <Icon name="chevron" size={14} />}</span>
      <ObtainedToggle name={name} />
      <DragonSprite name={name} />
      <div className="meta">
        <span className="nm">{labelOf(name)}</span>
        {how && <span className="how">{how}{d.cloneChance && <span className="clone"> · clone {d.cloneChance}</span>}</span>}
      </div>
      <div className="right">
        <Price name={name} />
        <BreedTime name={name} compact />
      </div>
    </div>
  );
}

/** "plus [fire] fire [cold] cold" or "any parents with [fire] fire [earth] earth"; repeated epics shown as "2× …". */
function Requirements({ items, withParents }: { items: Exclude<Ingredient, { kind: "dragon" }>[]; withParents: boolean }) {
  const counts = new Map<string, { ing: (typeof items)[number]; n: number }>();
  for (const ing of items) {
    const key = ing.kind === "special" ? `special:${ing.elementCount}` : `${ing.kind}:${ing.element}`;
    const prev = counts.get(key);
    counts.set(key, { ing, n: (prev?.n ?? 0) + 1 });
  }
  return (
    <div className="node reqs">
      <span className="chev" />
      <span className="req-lead">{withParents ? "plus" : "any parents with"}</span>
      {[...counts.values()].map(({ ing, n }, i) => (
        <span key={i} className="req">
          {ing.kind === "special" ? (
            <>{ing.elementCount} different elements</>
          ) : (
            <>
              <ElementFlag element={ing.element} className="flag-sm" />
              {n > 1 && `${n}× `}{ing.kind === "epic" ? `${ing.element} epic` : ing.element}
            </>
          )}
        </span>
      ))}
    </div>
  );
}
