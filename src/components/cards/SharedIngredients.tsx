import { sharedIngredients } from "../../lib/breeding";
import { useMemo } from "react";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { DragonSprite } from "../common/DragonSprite";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";


/** Dragons used in several target trees: the best ones to get first. */
export function SharedIngredients() {
  const { isOwned } = useObtained();
  const { targets } = useTargetList();
  const shared = useMemo(() => sharedIngredients(targets), [targets]);
  return (
    <section className="extra">
      <h3>🔁 Shared ingredients</h3>
      <p className="sub" style={{ margin: "-4px 0 12px" }}>
        Dragons that show up in the trees of several of your targets. Owning these first saves the most work.
      </p>
      <div className="shared" id="shared">
        {shared.map(({ name, usedInTargets }) => (
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
