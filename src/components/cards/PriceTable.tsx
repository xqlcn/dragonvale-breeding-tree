import { DRAGONS } from "../../data/dragons";
import { howToObtainText, labelOf } from "../../lib/ingredients";
import { priceOf, remainingTargetPrice, totalTargetPrice } from "../../lib/pricing";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { CandyAmount } from "../common/CandyAmount";
import { DragonSprite } from "../common/DragonSprite";
import { FavoriteToggle } from "../common/FavoriteToggle";
import { ObtainedToggle } from "../common/ObtainedToggle";


function howCell(name: string): string {
  const d = DRAGONS[name] ?? {};
  const how = d.evolvesFrom ? `Evolve from ${d.evolvesFrom} (${d.evolveRequirement})` : howToObtainText(name);
  return how + (d.riftOnly ? " · Rift only" : "");
}

/** All targets by price, with totals overall and still to buy. */
export function PriceTable() {
  const { owned } = useObtained();
  const { targets } = useTargetList();
  const rows = targets.slice().sort((a, b) => priceOf(b) - priceOf(a));
  const notObtained = targets.filter((n) => !owned.has(n)).length;
  return (
    <section className="extra">
      <h3>📋 Price summary</h3>
      <div className="tablewrap">
        <table id="tbl">
          <thead>
            <tr><th></th><th>Dragon</th><th>How to get</th><th style={{ textAlign: "right" }}>Price</th></tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n} data-name={n} className={owned.has(n) ? "owned" : ""}>
                <td className="ownc"><ObtainedToggle name={n} /><FavoriteToggle name={n} /></td>
                <td><DragonSprite name={n} /><b>{labelOf(n)}</b></td>
                <td>{howCell(n)}</td>
                <td className="num"><CandyAmount amount={priceOf(n)} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th colSpan={3}>Total for all {targets.length}</th><th style={{ textAlign: "right" }}><CandyAmount amount={totalTargetPrice(targets)} /></th></tr>
            <tr>
              <th colSpan={3} style={{ color: "var(--good)" }}>Still to buy ({notObtained} not obtained)</th>
              <th style={{ textAlign: "right", color: "var(--good)" }}><CandyAmount amount={remainingTargetPrice(targets, owned)} /></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
