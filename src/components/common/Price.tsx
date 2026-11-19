import { DRAGONS } from "../../data/dragons";
import { CurrencyAmount } from "./CurrencyAmount";

/** Market price of a dragon, or "Not sold" when it isn't in the event market. */
export function Price({ name }: { name: string }) {
  const price = DRAGONS[name]?.price;
  return price ? (
    <span className="price"><CurrencyAmount amount={price} /></span>
  ) : (
    <span className="price none" title="Not in the event market: breed it or own it already">Not sold</span>
  );
}
