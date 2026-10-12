import { useContext, useState } from "react";
import { DRAGONS } from "../../data/dragons";
import type { RecipeItem } from "../../data/types";
import { requirementsOf } from "../../lib/breeding";
import { howToObtainText, labelOf, parseIngredient, type Ingredient } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { DragonSprite } from "../common/DragonSprite";
import { ElementFlag } from "../common/ElementFlag";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";
import { TreeExpansionContext } from "./treeExpansion";

/** Nodes shallower than this start expanded (unless already obtained). */
const AUTO_OPEN_DEPTH = 3;

/** Nested breeding tree for one target (its root is the card itself, so only its requirements are listed). */
export const BreedingTree = ({ name }: { name: string }) => (
  <ul className="tree">
    {requirementsOf(name).map((item, i) => <TreeItem key={`${item}-${i}`} item={item} depth={1} />)}
  </ul>
);

function TreeItem({ item, depth }: { item: RecipeItem; depth: number }) {
  const ing = parseIngredient(item);
  if (ing.kind !== "dragon") return <li><RequirementNode ingredient={ing} /></li>;
  return <DragonTreeItem name={ing.name} depth={depth} />;
}

function DragonTreeItem({ name, depth }: { name: string; depth: number }) {
  const { isOwned } = useObtained();
  const owned = isOwned(name);
  const kids = requirementsOf(name);
  const command = useContext(TreeExpansionContext);

  const [open, setOpen] = useState(depth < AUTO_OPEN_DEPTH && !owned);
  // Adjust state during render (React's recommended alternative to effects for derived resets):
  // collapse when this dragon becomes obtained, and obey Expand/Collapse-all clicks.
  const [prevOwned, setPrevOwned] = useState(owned);
  if (owned !== prevOwned) {
    setPrevOwned(owned);
    if (owned) setOpen(false);
  }
  const [seenSeq, setSeenSeq] = useState(command.seq);
  if (command.seq !== seenSeq) {
    setSeenSeq(command.seq);
    setOpen(command.expand);
  }

  const className = owned ? "owned" : undefined;
  if (!kids.length) return <li data-name={name} className={className}><DragonNode name={name} expandable={false} /></li>;
  return (
    <li data-name={name} className={className}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary><DragonNode name={name} expandable /></summary>
        <ul>{kids.map((k, i) => <TreeItem key={`${k}-${i}`} item={k} depth={depth + 1} />)}</ul>
      </details>
    </li>
  );
}

/** Row for a specific dragon: caret, ✓ toggle, sprite, name, how-to, price and badges. */
function DragonNode({ name, expandable }: { name: string; expandable: boolean }) {
  const d = DRAGONS[name] ?? {};
  const how = howToObtainText(name);
  const badges = [
    d.breedAtNight && "🌙",
    d.riftOnly && "🌀 Rift",
    d.cloneChance && `🧬 clone ${d.cloneChance}`,
  ].filter(Boolean);
  return (
    <div className="node">
      {expandable ? <span className="caret">▶</span> : <span className="leafpad"></span>}
      <ObtainedToggle name={name} />
      <DragonSprite name={name} />
      <div className="meta">
        <span className="nm">{labelOf(name)}</span>
        {how ? <span className="how">{how}</span> : d.note ? <span className="how">{d.note}</span> : null}
        {d.evolvesFrom && <span className="how">needs {d.evolveRequirement}</span>}
      </div>
      <div className="right">
        <Price name={name} />
        {badges.length > 0 && <span className="badge-night">{badges.join(" · ")}</span>}
      </div>
    </div>
  );
}

/** Leaf row for an element / epic / special requirement ("any dark dragon"). */
function RequirementNode({ ingredient }: { ingredient: Exclude<Ingredient, { kind: "dragon" }> }) {
  if (ingredient.kind === "special") {
    return (
      <div className="node elnode">
        <span className="leafpad"></span>
        <span className="flag" style={{ fontSize: 22, width: 30, textAlign: "center" }}>🌈</span>
        <span className="how">two parents with at least {ingredient.elementCount} different elements between them</span>
      </div>
    );
  }
  return (
    <div className="node elnode">
      <span className="leafpad"></span>
      <ElementFlag element={ingredient.element} />
      <span className="how">{ingredient.kind === "epic" ? `any ${ingredient.element} epic dragon` : `any ${ingredient.element} dragon`}</span>
    </div>
  );
}
