import type { TabId } from "../../hooks/useHashTab";

const TABS: { id: TabId; label: string }[] = [
  { id: "cards", label: "🌳 Trees & prices" },
  { id: "graph", label: "🕸 Breeding graph" },
];

export const Tabs = ({ active, onSelect }: { active: TabId; onSelect: (t: TabId) => void }) => (
  <nav className="tabs" role="tablist">
    {TABS.map((t) => (
      <button key={t.id} role="tab" aria-selected={t.id === active} onClick={() => onSelect(t.id)}>
        {t.label}
      </button>
    ))}
  </nav>
);
