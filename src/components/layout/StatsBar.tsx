import { TARGETS } from "../../data/targets";
import { formatCandy } from "../../lib/format";
import { labelOf } from "../../lib/ingredients";
import { cheapestTarget, mostExpensiveTarget, priceOf, remainingTargetPrice, totalTargetPrice } from "../../lib/pricing";
import { useObtained } from "../../state/ObtainedContext";
import { CandyAmount } from "../common/CandyAmount";

const total = totalTargetPrice();
const maxName = mostExpensiveTarget();
const minName = cheapestTarget();

/** Progress + headline price tiles. */
export function StatsBar() {
  const { owned } = useObtained();
  const haveCount = TARGETS.filter((n) => owned.has(n)).length;
  return (
    <div className="stats" id="stats">
      <div className="stat"><b style={{ color: "var(--good)" }}>{haveCount} / {TARGETS.length}</b><small>obtained</small></div>
      <div className="stat">
        <b><CandyAmount amount={remainingTargetPrice(owned)} /></b>
        <small>to buy the rest{haveCount ? ` (of ${formatCandy(total)})` : ""}</small>
      </div>
      <div className="stat"><b>{maxName}</b><small>most expensive (<CandyAmount amount={priceOf(maxName)} />)</small></div>
      <div className="stat"><b>{labelOf(minName)}</b><small>cheapest (<CandyAmount amount={priceOf(minName)} />)</small></div>
    </div>
  );
}
