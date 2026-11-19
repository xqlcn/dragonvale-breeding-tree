import type { TabId } from "../../hooks/useHashTab";
import type { ShowFilter, SortMode } from "../../lib/targetList";
import { Icon } from "../common/Icon";

export interface ViewControls {
  query: string;
  sort: SortMode;
  show: ShowFilter;
  adultSprites: boolean;
}

interface Props extends ViewControls {
  tab: TabId;
  onTab: (t: TabId) => void;
  onChange: (patch: Partial<ViewControls>) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "trees", label: "Trees" },
  { id: "table", label: "Table" },
  { id: "graph", label: "Graph" },
];

/** Sticky bar: view tabs, plus search / sort / show / sprite style for the Trees and Table views. */
export function ViewBar({ tab, onTab, onChange, ...c }: Props) {
  return (
    <div className="viewbar">
      <nav className="seg tabs" role="tablist" aria-label="View">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={t.id === tab} onClick={() => onTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab !== "graph" && (
        <div className="controls">
          <label className="search">
            <Icon name="search" />
            <input
              id="q" type="search" placeholder="Search dragons or parents…" aria-label="Search dragons or parents"
              value={c.query} onChange={(e) => onChange({ query: e.target.value })}
            />
          </label>
          <label className="select">
            <span>Sort</span>
            <select id="sort" value={c.sort} onChange={(e) => onChange({ sort: e.target.value as SortMode })}>
              <option value="list">List order</option>
              <option value="desc">Price, high first</option>
              <option value="asc">Price, low first</option>
              <option value="az">Name</option>
            </select>
          </label>
          <label className="select">
            <span>Show</span>
            <select id="show" value={c.show} onChange={(e) => onChange({ show: e.target.value as ShowFilter })}>
              <option value="all">All</option>
              <option value="need">Still needed</option>
              <option value="ready">Ready to breed</option>
              <option value="have">Obtained</option>
            </select>
          </label>
          {(c.query || c.show !== "all") && (
            <button type="button" className="clearbtn" id="clearfilters" title="Clear the search and show every dragon"
              onClick={() => onChange({ query: "", show: "all" })}>
              <Icon name="close" size={14} /> Clear
            </button>
          )}
          <div className="seg small" role="group" aria-label="Dragon pictures">
            <button type="button" id="babies" aria-pressed={!c.adultSprites} onClick={() => onChange({ adultSprites: false })}>Baby</button>
            <button type="button" id="adults" aria-pressed={c.adultSprites} onClick={() => onChange({ adultSprites: true })}>Adult</button>
          </div>
        </div>
      )}
    </div>
  );
}
