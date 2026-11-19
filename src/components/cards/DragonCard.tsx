import { DRAGONS } from "../../data/dragons";
import { requirementsOf } from "../../lib/breeding";
import { labelOf } from "../../lib/ingredients";
import { parentPurchaseCost } from "../../lib/pricing";
import { isReadyToBreed } from "../../lib/targetList";
import { useObtained } from "../../state/ObtainedContext";
import { BreedTime } from "../common/BreedTime";
import { CurrencyAmount } from "../common/CurrencyAmount";
import { DragonSprite } from "../common/DragonSprite";
import { FavoriteToggle } from "../common/FavoriteToggle";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";
import { RarityLabel } from "../common/RarityLabel";
import { BreedingTree } from "./BreedingTree";

/** One dragon: picture, price / rarity / breeding time, what's notable about getting it, and its tree. */
export function DragonCard({ name, hidden }: { name: string; hidden: boolean }) {
  const { isOwned } = useObtained();
  const d = DRAGONS[name] ?? {};
  const owned = isOwned(name);
  const ready = isReadyToBreed(name, isOwned);
  const parentCost = parentPurchaseCost(name);
  const breedable = requirementsOf(name).length > 0;
  return (
    // Hidden with display:none (not unmounted) so open trees survive filtering.
    <article className={owned ? "card owned" : "card"} data-name={name} style={hidden ? { display: "none" } : undefined}>
      <div className="card-head">
        <DragonSprite name={name} />
        <div className="card-id">
          <h2>{labelOf(name)}</h2>
          <div className="card-meta">
            <Price name={name} />
            <RarityLabel name={name} />
            <BreedTime name={name} />
          </div>
        </div>
        <div className="card-actions">
          <FavoriteToggle name={name} size="lg" />
          <ObtainedToggle name={name} size="lg" />
        </div>
      </div>

      {(ready || d.cloneChance || d.evolvesFrom || parentCost !== null) && (
        <div className="facts">
          {ready && <span className="fact good">Ready to breed</span>}
          {d.evolvesFrom && <span className="fact evolve">Evolves from {labelOf(d.evolvesFrom)} · needs {d.evolveRequirement}</span>}
          {d.cloneChance && <span className="fact" title="Co-op single-clone odds are at least as good as breeding">Clone {d.cloneChance} at the co-op</span>}
          {parentCost !== null && <span className="fact">Parents cost <CurrencyAmount amount={parentCost} /></span>}
        </div>
      )}
      {d.note && <p className="note">{d.note}</p>}

      <div className="card-tree">
        {breedable ? <BreedingTree name={name} /> : <p className="muted">Can't be bred: buy it or clone it.</p>}
      </div>
    </article>
  );
}
