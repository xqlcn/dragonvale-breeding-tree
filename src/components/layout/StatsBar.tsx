import { formatCandy } from "../../lib/format";
import { labelOf } from "../../lib/ingredients";
import { cheapestTarget, mostExpensiveTarget, priceOf, remainingTargetPrice, totalTargetPrice } from "../../lib/pricing";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { CandyAmount } from "../common/CandyAmount";

/** Progress + headline price tiles for the active list. */
export function StatsBar() {
  const { owned } = useObtained();
  const { targets } = useTargetList();
  const total = totalTargetPrice(targets);
  const maxName = mostExpensiveTarget(targets);
  const minName = cheapestTarget(targets);
  const haveCount = targets.filter((n) => owned.has(n)).length;
  return (
    <div className="stats" id="stats">
      <div className="stat"><b style={{ color: "var(--good)" }}>{haveCount} / {targets.length}</b><small>obtained</small></div>
      <div className="stat">
        <b><CandyAmount amount={remainingTargetPrice(targets, owned)} /></b>
        <small>to buy the rest{haveCount ? ` (of ${formatCandy(total)})` : ""}</small>
      </div>
      <div className="stat">
        <b>{maxName ?? "—"}</b>
        <small>most expensive{maxName && <> (<CandyAmount amount={priceOf(maxName)} />)</>}</small>
      </div>
      <div className="stat">
        <b>{minName ? labelOf(minName) : "—"}</b>
        <small>cheapest{minName && <> (<CandyAmount amount={priceOf(minName)} />)</>}</small>
      </div>
    </div>
  );
}
