import { useState } from "react";
import type { OwnedFilter, SortMode } from "../../lib/targetList";
import { useObtained } from "../../state/ObtainedContext";
import { CardGrid } from "./CardGrid";
import { CardsToolbar } from "./CardsToolbar";
import { PriceTable } from "./PriceTable";
import { SharedIngredients } from "./SharedIngredients";
import { TreeExpansionContext, type TreeExpansionCommand } from "./treeExpansion";

/** "Trees & prices" tab. */
export function CardsView() {
  const { owned, clear } = useObtained();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("list");
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>("all");
  const [expansion, setExpansion] = useState<TreeExpansionCommand>({ seq: 0, expand: true });

  const setAllExpanded = (expand: boolean) => setExpansion((c) => ({ seq: c.seq + 1, expand }));
  const clearObtained = () => {
    if (owned.size && confirm("Clear all obtained marks?")) clear();
  };

  return (
    <>
      <p className="hint">
        Click any dragon in a tree to expand / collapse it. Click a <b style={{ color: "var(--good)" }}>✓</b> circle to
        mark a dragon as obtained. Your progress is saved in this browser.
      </p>
      <CardsToolbar
        query={query} onQueryChange={setQuery}
        sort={sort} onSortChange={setSort}
        ownedFilter={ownedFilter} onOwnedFilterChange={setOwnedFilter}
        onExpandAll={() => setAllExpanded(true)}
        onCollapseAll={() => setAllExpanded(false)}
        onClearObtained={clearObtained}
      />
      <TreeExpansionContext.Provider value={expansion}>
        {/* Keyed by sort: changing the sort rebuilds the cards with default expansion, as the original did. */}
        <CardGrid key={sort} sort={sort} query={query} ownedFilter={ownedFilter} />
      </TreeExpansionContext.Provider>
      <SharedIngredients />
      <PriceTable />
    </>
  );
}
