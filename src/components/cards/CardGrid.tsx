import { cardMatches, emptyMessage, sortTargets, type OwnedFilter, type SortMode } from "../../lib/targetList";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { DragonCard } from "./DragonCard";

interface Props { sort: SortMode; query: string; ownedFilter: OwnedFilter }

/** Grid of target cards. Non-matching cards stay mounted but hidden. */
export function CardGrid({ sort, query, ownedFilter }: Props) {
  const { isOwned } = useObtained();
  const { targets } = useTargetList();
  const q = query.trim().toLowerCase();
  const list = sortTargets(targets, sort);
  const visible = new Set(list.filter((n) => cardMatches(n, q, ownedFilter, isOwned(n))));
  return (
    <div className="grid" id="grid">
      {list.map((n) => <DragonCard key={n} name={n} hidden={!visible.has(n)} />)}
      <div className="empty" hidden={visible.size > 0}>{emptyMessage(q, ownedFilter, list.length === 0)}</div>
    </div>
  );
}
