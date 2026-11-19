import type { ViewControls } from "../layout/ViewBar";
import { CardGrid } from "./CardGrid";
import { KeyParents } from "./KeyParents";

/** "Trees" view: the most-shared parents, then a card per dragon with its breeding tree. */
export function TreesView({ controls, onSearch }: { controls: ViewControls; onSearch: (q: string) => void }) {
  return (
    <>
      <KeyParents query={controls.query} onPick={onSearch} />
      {/* Keyed by sort: a new order rebuilds the cards with their trees collapsed. */}
      <CardGrid key={controls.sort} sort={controls.sort} query={controls.query} show={controls.show} />
    </>
  );
}
