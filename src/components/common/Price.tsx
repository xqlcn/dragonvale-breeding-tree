import { DRAGONS } from "../../data/dragons";
import { CandyAmount } from "./CandyAmount";

/** Market price of a dragon, or "not in market". */
export function Price({ name }: { name: string }) {
  const price = DRAGONS[name]?.price;
  return price ? (
    <span className="price"><CandyAmount amount={price} /></span>
  ) : (
    <span className="price none">not in market</span>
  );
}
