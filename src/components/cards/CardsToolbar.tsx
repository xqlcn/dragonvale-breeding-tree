import type { OwnedFilter, SortMode } from "../../lib/targetList";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  ownedFilter: OwnedFilter;
  onOwnedFilterChange: (f: OwnedFilter) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearObtained: () => void;
}

/** Sticky search / sort / filter bar above the card grid. */
export const CardsToolbar = (p: Props) => (
  <div className="bar">
    <input
      id="q"
      type="search"
      placeholder="Search dragons (matches anything in a tree, e.g. Scourge)…"
      value={p.query}
      onChange={(e) => p.onQueryChange(e.target.value)}
    />
    <select id="sort" value={p.sort} onChange={(e) => p.onSortChange(e.target.value as SortMode)}>
      <option value="list">Your list order</option>
      <option value="desc">Price: high → low</option>
      <option value="asc">Price: low → high</option>
      <option value="az">Name A → Z</option>
    </select>
    <select id="ownf" value={p.ownedFilter} onChange={(e) => p.onOwnedFilterChange(e.target.value as OwnedFilter)}>
      <option value="all">All dragons</option>
      <option value="need">Still needed</option>
      <option value="have">Obtained</option>
    </select>
    <button id="expand" onClick={p.onExpandAll}>Expand all</button>
    <button id="collapse" onClick={p.onCollapseAll}>Collapse all</button>
    <button id="clearown" onClick={p.onClearObtained}>Clear obtained</button>
  </div>
);
