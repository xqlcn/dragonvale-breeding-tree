import { DRAGONS } from "../../data/dragons";
import { requirementsOf, usedBy } from "../../lib/breeding";
import { labelOf, parseIngredient } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { BreedTime } from "../common/BreedTime";
import { DragonSprite } from "../common/DragonSprite";
import { ElementFlag } from "../common/ElementFlag";
import { Icon } from "../common/Icon";
import { Price } from "../common/Price";
import { RarityLabel } from "../common/RarityLabel";

interface Props {
  name: string;
  /** Dragons in the current graph (so "Used for" only lists ones you can see). */
  nodes: readonly string[];
  onFocus: (name: string) => void;
  onClose: () => void;
}

/** Side panel for the selected graph dragon: key facts, what it needs, what it's used for, and actions. */
export function GraphDetails({ name, nodes, onFocus, onClose }: Props) {
  const { isOwned, toggle } = useObtained();
  const { isFavorite, toggleFavorite } = useTargetList();
  const d = DRAGONS[name] ?? {};
  const needs = requirementsOf(name).map(parseIngredient);
  const usedFor = usedBy(name).filter((n) => nodes.includes(n));
  const owned = isOwned(name);
  const fav = isFavorite(name);

  return (
    <aside className="gpanel" id="gpanel" aria-label={`${labelOf(name)} details`}>
      <button type="button" className="iconbtn gp-close" aria-label="Close details" onClick={onClose}>
        <Icon name="close" />
      </button>
      <div className="gp-head">
        <DragonSprite name={name} />
        <div>
          <h3>{labelOf(name)}</h3>
          <div className="card-meta"><Price name={name} /><RarityLabel name={name} /></div>
          <BreedTime name={name} />
        </div>
      </div>

      {(d.evolvesFrom || d.cloneChance || d.note) && (
        <div className="gp-facts">
          {d.evolvesFrom && <p>Evolves from {labelOf(d.evolvesFrom)}; needs {d.evolveRequirement}.</p>}
          {d.cloneChance && <p>Clone {d.cloneChance} at the co-op.</p>}
          {d.note && <p className="muted">{d.note}</p>}
        </div>
      )}

      <h4><span className="dot need" />Needs</h4>
      {needs.length ? (
        <div className="chips">
          {needs.map((ing, i) =>
            ing.kind === "dragon" ? (
              <button key={i} type="button" className={"chip" + (isOwned(ing.name) ? " owned" : "")} onClick={() => onFocus(ing.name)}>
                <DragonSprite name={ing.name} alt="" />{labelOf(ing.name)}
              </button>
            ) : ing.kind === "special" ? (
              <span key={i} className="chip">{ing.elementCount} different elements</span>
            ) : (
              <span key={i} className="chip"><ElementFlag element={ing.element} className="flag-sm" />{ing.kind === "epic" ? `${ing.element} epic` : ing.element}</span>
            ),
          )}
        </div>
      ) : <p className="muted">Can't be bred: buy it or clone it.</p>}

      <h4><span className="dot used" />Used for</h4>
      {usedFor.length ? (
        <div className="chips">
          {usedFor.map((n) => (
            <button key={n} type="button" className={"chip" + (isOwned(n) ? " owned" : "")} onClick={() => onFocus(n)}>
              <DragonSprite name={n} alt="" />{labelOf(n)}
            </button>
          ))}
        </div>
      ) : <p className="muted">Nothing else in this graph.</p>}

      <div className="gp-actions">
        <button type="button" className={"btn" + (owned ? " on-good" : "")} aria-pressed={owned} onClick={() => toggle(name)}>
          <Icon name="check" strokeWidth={3} /> {owned ? "Obtained" : "Mark obtained"}
        </button>
        <button type="button" className={"btn" + (fav ? " on-star" : "")} aria-pressed={fav} onClick={() => toggleFavorite(name)}>
          <Icon name="star" filled={fav} /> {fav ? "On my list" : "Add to my list"}
        </button>
      </div>
    </aside>
  );
}
