import { sharedIngredients } from "../../lib/breeding";
import { useObtained } from "../../state/ObtainedContext";
import { DragonSprite } from "../common/DragonSprite";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";

const SHARED = sharedIngredients();

/** Dragons used in several target trees: the best ones to get first. */
export function SharedIngredients() {
  const { isOwned } = useObtained();
  return (
    <section className="extra">
      <h3>🔁 Shared ingredients</h3>
      <p className="sub" style={{ margin: "-4px 0 12px" }}>
        Dragons that show up in the trees of several of your targets. Owning these first saves the most work.
      </p>
      <div className="shared" id="shared">
        {SHARED.map(({ name, usedInTargets }) => (
          <div key={name} className={isOwned(name) ? "node owned" : "node"} data-name={name} title={`Used in: ${usedInTargets.join(", ")}`}>
            <ObtainedToggle name={name} />
            <DragonSprite name={name} />
            <div className="meta">
              <span className="nm">{name}</span>
              <span className="how">in {usedInTargets.length} trees: {usedInTargets.join(", ")}</span>
            </div>
            <div className="right"><Price name={name} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
