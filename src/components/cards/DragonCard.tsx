import { Fragment } from "react";
import { DRAGONS } from "../../data/dragons";
import { requirementsOf } from "../../lib/breeding";
import { ingredientText, labelOf, parseIngredient } from "../../lib/ingredients";
import { parentPurchaseCost } from "../../lib/pricing";
import { useObtained } from "../../state/ObtainedContext";
import { CandyAmount } from "../common/CandyAmount";
import { DragonSprite } from "../common/DragonSprite";
import { DragonTags } from "../common/DragonTags";
import { FavoriteToggle } from "../common/FavoriteToggle";
import { ElementFlag } from "../common/ElementFlag";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";
import { BreedingTree } from "./BreedingTree";

/** Card for one target: header (sprite, price, formula, tags, obtained toggle) + breeding tree. */
export function DragonCard({ name, hidden }: { name: string; hidden: boolean }) {
  const { isOwned } = useObtained();
  const parentCost = parentPurchaseCost(name);
  return (
    // Hidden with display:none (not unmounted) so tree expansion state survives filtering.
    <article className={isOwned(name) ? "card owned" : "card"} data-name={name} style={hidden ? { display: "none" } : undefined}>
      <div className="card-head">
        <DragonSprite name={name} />
        <div>
          <h2>{labelOf(name)}</h2>
          <Price name={name} />
          <div className="formula"><Formula name={name} /></div>
          <div className="tags">
            <DragonTags name={name} />
            {parentCost !== null && (
              <span className="tag subtotal">Buying the specific parents: <CandyAmount amount={parentCost} /></span>
            )}
          </div>
          <ObtainedToggle name={name} big />
          <FavoriteToggle name={name} big />
        </div>
      </div>
      <div className="tree-wrap">
        <div className="lbl">Breeding tree</div>
        {requirementsOf(name).length > 0
          ? <BreedingTree name={name} />
          : <p className="hint">Can't be bred: buy it from the market or clone it at the co-op.</p>}
      </div>
    </article>
  );
}

/** "MACABRE + SCOURGE", with element requirements shown as flags. */
function Formula({ name }: { name: string }) {
  const d = DRAGONS[name];
  if (d?.evolvesFrom) return <>Evolve from <strong>{d.evolvesFrom}</strong></>;
  if (requirementsOf(name).length === 0) return <>Buy / clone only</>;
  return (
    <>
      {requirementsOf(name).map((item, i) => {
        const ing = parseIngredient(item);
        return (
          <Fragment key={`${item}-${i}`}>
            {i > 0 && " + "}
            {ing.kind === "element" || ing.kind === "epic"
              ? <ElementFlag element={ing.element} className="flag-sm" />
              : <strong>{ingredientText(item)}</strong>}
          </Fragment>
        );
      })}
    </>
  );
}
