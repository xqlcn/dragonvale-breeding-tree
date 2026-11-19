import { CURRENCY_NAME } from "../../config";
import { formatAmount } from "../../lib/format";
import { remainingTargetPrice, totalTargetPrice } from "../../lib/pricing";
import { isReadyToBreed } from "../../lib/targetList";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { CurrencyAmount } from "../common/CurrencyAmount";

/** Progress, what's left to spend, and how many dragons can be bred right now (click to show them). */
export function Summary({ readyActive, onToggleReady }: { readyActive: boolean; onToggleReady: () => void }) {
  const { owned, isOwned } = useObtained();
  const { targets } = useTargetList();
  const have = targets.filter(isOwned).length;
  const ready = targets.filter((n) => isReadyToBreed(n, isOwned)).length;
  const total = totalTargetPrice(targets);
  const pct = targets.length ? Math.round((have / targets.length) * 100) : 0;
  return (
    <section className="summary" aria-label="Progress">
      <div className="sum-item" id="sum-progress">
        <span className="sum-label">Obtained</span>
        <span className="sum-value">{have} <small>of {targets.length}</small></span>
        <span className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={targets.length} aria-valuenow={have} aria-label="Obtained">
          <span style={{ width: `${pct}%` }} />
        </span>
      </div>
      <div className="sum-item" id="sum-cost">
        <span className="sum-label">{CURRENCY_NAME} still needed</span>
        <span className="sum-value"><CurrencyAmount amount={remainingTargetPrice(targets, owned)} /></span>
        <span className="sum-note">{have ? `of ${formatAmount(total)} to buy everything` : "to buy everything on the list"}</span>
      </div>
      <button type="button" className="sum-item sum-ready" id="sum-ready" onClick={onToggleReady}
        disabled={!ready && !readyActive} aria-pressed={readyActive}
        title={readyActive ? "Show every dragon again" : ready ? "Show the dragons you can breed now" : "Mark parents as obtained and dragons you can breed show up here"}>
        <span className="sum-label">Ready to breed</span>
        <span className="sum-value">{ready}</span>
        <span className="sum-note">{readyActive ? "showing them · click to show all" : ready ? "every parent obtained · show them" : "mark parents you own"}</span>
      </button>
    </section>
  );
}
