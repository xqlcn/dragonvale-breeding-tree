import { useEffect, useRef, useState } from "react";
import { EVENT_DRAGONS, EVENT_SECTIONS } from "../../data/targets";
import { labelOf } from "../../lib/ingredients";
import { useTargetList } from "../../state/TargetListContext";
import { DragonSprite } from "../common/DragonSprite";
import { Price } from "../common/Price";

/**
 * Checklist of every event dragon, grouped by market section, for adding / removing many dragons to
 * "My list" at once. Changes apply immediately. "Select all / Clear all" and the section boxes act on
 * the dragons the search currently shows.
 */
export function ListEditor({ onClose }: { onClose: () => void }) {
  const { favorites, isFavorite, toggleFavorite, setFavoritesMany } = useTargetList();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const sections = EVENT_SECTIONS
    .map((s) => ({ ...s, shown: s.dragons.filter((n) => !q || labelOf(n).toLowerCase().includes(q)) }))
    .filter((s) => s.shown.length > 0);
  const shown = sections.flatMap((s) => s.shown);

  return (
    <div className="leditor" id="leditor" role="region" aria-label="Edit my list">
      <div className="leditor-bar">
        <input
          type="search" placeholder="Filter dragons…" value={query} aria-label="Filter dragons"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" id="lselall" onClick={() => setFavoritesMany(shown, true)} disabled={!shown.length}>
          Select all{q ? " shown" : ""}
        </button>
        <button type="button" id="lclrall" onClick={() => setFavoritesMany(shown, false)} disabled={!shown.length}>
          Clear all{q ? " shown" : ""}
        </button>
        <span className="hint">{favorites.length} of {EVENT_DRAGONS.length} in your list</span>
        <button type="button" className="done" onClick={onClose}>Done</button>
      </div>
      {sections.length === 0 && <p className="empty">No dragons match “{query}”.</p>}
      {sections.map((s) => {
        const chosen = s.shown.filter(isFavorite).length;
        return (
          <fieldset key={s.name} className="lsection">
            <legend>
              <label>
                <SectionCheckbox
                  checked={chosen === s.shown.length} indeterminate={chosen > 0 && chosen < s.shown.length}
                  onChange={(on) => setFavoritesMany(s.shown, on)} label={`All ${s.name} dragons`}
                />
                {s.name} <span className="count">{chosen} / {s.shown.length}</span>
              </label>
            </legend>
            <div className="lgrid">
              {s.shown.map((n) => (
                <label key={n} className={isFavorite(n) ? "litem on" : "litem"} data-name={n}>
                  <input type="checkbox" checked={isFavorite(n)} onChange={() => toggleFavorite(n)} />
                  <DragonSprite name={n} alt="" />
                  <span className="nm">{labelOf(n)}</span>
                  <Price name={n} />
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** Checkbox that can show the "some selected" (indeterminate) state, which has no HTML attribute. */
function SectionCheckbox({ checked, indeterminate, onChange, label }: {
  checked: boolean; indeterminate: boolean; onChange: (on: boolean) => void; label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />;
}
