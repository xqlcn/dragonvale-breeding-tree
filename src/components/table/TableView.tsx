import { CURRENCY_NAME } from "../../config";
import { howToObtainText, labelOf } from "../../lib/ingredients";
import { remainingTargetPrice, totalTargetPrice } from "../../lib/pricing";
import { cardMatches, emptyMessage, sortTargets } from "../../lib/targetList";
import { DRAGONS } from "../../data/dragons";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { BreedTime } from "../common/BreedTime";
import { CurrencyAmount } from "../common/CurrencyAmount";
import { DragonSprite } from "../common/DragonSprite";
import { FavoriteToggle } from "../common/FavoriteToggle";
import { ObtainedToggle } from "../common/ObtainedToggle";
import { Price } from "../common/Price";
import { RarityLabel } from "../common/RarityLabel";
import type { ViewControls } from "../layout/ViewBar";

function howCell(name: string): string {
  const d = DRAGONS[name] ?? {};
  if (d.evolvesFrom) return `Evolve ${labelOf(d.evolvesFrom)} (needs ${d.evolveRequirement})`;
  return howToObtainText(name) || "Buy or clone only";
}

/** "Table" view: one row per dragon, using the same search / sort / show as Trees, with totals. */
export function TableView({ controls }: { controls: ViewControls }) {
  const { owned, isOwned } = useObtained();
  const { targets } = useTargetList();
  const q = controls.query.trim().toLowerCase();
  const rows = sortTargets(targets, controls.sort).filter((n) => cardMatches(n, q, controls.show, isOwned));
  return (
    <div className="tablewrap">
      <table id="tbl">
        <thead>
          <tr>
            <th className="tick" aria-label="Obtained"></th>
            <th>Dragon</th>
            <th>How to get</th>
            <th>Breeding time</th>
            <th className="num">Price</th>
            <th className="tick" aria-label="On my list"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} data-name={n} className={owned.has(n) ? "owned" : ""}>
              <td className="tick"><ObtainedToggle name={n} /></td>
              <td className="who"><DragonSprite name={n} /><span><b>{labelOf(n)}</b><RarityLabel name={n} /></span></td>
              <td className="how">{howCell(n)}</td>
              <td><BreedTime name={n} /></td>
              <td className="num"><Price name={n} /></td>
              <td className="tick"><FavoriteToggle name={n} /></td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={6} className="empty">{emptyMessage(q, controls.show, targets.length === 0)}</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>All {targets.length} on the list</th>
            <th className="num"><CurrencyAmount amount={totalTargetPrice(targets)} /></th>
            <th></th>
          </tr>
          <tr className="still">
            <th colSpan={4}>{CURRENCY_NAME} still needed ({targets.filter((n) => !owned.has(n)).length} not obtained)</th>
            <th className="num"><CurrencyAmount amount={remainingTargetPrice(targets, owned)} /></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
