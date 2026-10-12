import { DRAGONS } from "../data/dragons";
import { TARGETS } from "../data/targets";
import { isDragonItem } from "./ingredients";
import { requirementsOf } from "./breeding";

/** Market price of a target (targets are always priced). */
export const priceOf = (name: string): number => DRAGONS[name]?.price ?? 0;

export const totalTargetPrice = (): number => TARGETS.reduce((s, n) => s + priceOf(n), 0);

/** Sum of prices for targets not yet obtained. */
export const remainingTargetPrice = (owned: ReadonlySet<string>): number =>
  TARGETS.filter((n) => !owned.has(n)).reduce((s, n) => s + priceOf(n), 0);

/** Most expensive target (first one wins ties). */
export const mostExpensiveTarget = (): string => TARGETS.reduce((a, b) => (priceOf(a) >= priceOf(b) ? a : b));
/** Cheapest target (first one wins ties). */
export const cheapestTarget = (): string => TARGETS.reduce((a, b) => (priceOf(a) <= priceOf(b) ? a : b));

/**
 * Cost of buying a dragon's specific parents, or null when not every specific parent is
 * sold in the market (or there are none, or the dragon is obtained by evolution).
 */
export function parentPurchaseCost(name: string): number | null {
  const d = DRAGONS[name];
  if (!d || d.evolvesFrom) return null;
  const parents = requirementsOf(name).filter(isDragonItem);
  const buyable = parents.filter((k) => DRAGONS[k]?.price);
  if (!buyable.length || buyable.length !== parents.length) return null;
  return buyable.reduce((s, k) => s + priceOf(k), 0);
}
