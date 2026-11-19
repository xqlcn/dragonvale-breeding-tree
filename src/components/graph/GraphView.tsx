import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { Icon } from "../common/Icon";
import { edgeHighlightClasses, focusSets, nodeHighlightClasses } from "./focus";
import { GraphDetails } from "./GraphDetails";
import { GraphNode } from "./GraphNode";
import { GraphToolbar } from "./GraphToolbar";
import { boundingBox, layoutGraph, type Box, type GraphLayout } from "./layout";
import { usePanZoom } from "./usePanZoom";

/** Width the details panel covers on wide screens (it stacks below the graph on narrow ones). */
const PANEL_INSET = 340;
const panelInset = (focus: string) =>
  focus && typeof matchMedia === "function" && matchMedia("(min-width: 800px)").matches ? PANEL_INSET : 0;

/**
 * "Graph" view for the active list. The layout is computed lazily while the view is `active`, once per
 * distinct list (cached), and stays mounted (just hidden) so pan / zoom / selection survive view switches.
 * Clicking a dragon highlights what it needs and what it's used for, and opens its details panel.
 */
export function GraphView({ active }: { active: boolean }) {
  const { isOwned, toggle } = useObtained();
  const { targets } = useTargetList();
  const listKey = targets.join("|");
  const [layouts, setLayouts] = useState<ReadonlyMap<string, GraphLayout>>(new Map());
  const layout = layouts.get(listKey) ?? null;
  const [status, setStatus] = useState("Laying out graph…");
  const [focus, setFocus] = useState("");
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<SVGGElement>(null);
  const { fit, zoomAtCenter, movedRef } = usePanZoom(viewRef, worldRef);

  // Lay out the (code-split) ELK graph for this list the first time it's shown; results are cached per list.
  useEffect(() => {
    if (!active || layouts.has(listKey)) return;
    if (!targets.length) { setStatus("Your list is empty. Use Edit list to add dragons."); return; }
    let cancelled = false;
    setStatus("Laying out graph…");
    layoutGraph(targets).then(
      (l) => { if (!cancelled) setLayouts((m) => new Map(m).set(listKey, l)); },
      (err: Error) => { if (!cancelled) setStatus(err.message); },
    );
    return () => { cancelled = true; };
  }, [active, listKey, targets, layouts]);

  // Drop the selection when its dragon isn't in the current list's graph.
  useEffect(() => {
    if (layout && focus && !layout.nodes.includes(focus)) setFocus("");
  }, [layout, focus]);

  const targetSet = useMemo(() => new Set(targets), [targets]);
  const fullBox = useCallback((l: GraphLayout): Box => ({ x: 0, y: 0, w: l.width, h: l.height }), []);

  /** Selects (or clears) a dragon and frames it with everything related to it. */
  const focusOn = useCallback((name: string) => {
    setFocus(name);
    if (!layout) return;
    const sets = focusSets(name);
    fit(sets ? boundingBox(sets.related, layout.positions) : fullBox(layout), panelInset(name), true);
  }, [fit, layout, fullBox]);

  /** Fit button / window resize: frame the selection, or the whole graph. */
  const refit = useCallback(() => {
    if (!layout) return;
    const sets = focusSets(focusRef.current);
    fit(sets ? boundingBox(sets.related, layout.positions) : fullBox(layout), panelInset(focusRef.current), true);
  }, [layout, fit, fullBox]);

  // Fit the whole graph when it first appears and every time the view is re-opened.
  useLayoutEffect(() => {
    if (active && layout) fit(fullBox(layout), panelInset(focusRef.current));
  }, [active, layout, fit, fullBox]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", refit);
    return () => window.removeEventListener("resize", refit);
  }, [active, refit]);

  const onSelectNode = useCallback((name: string, e: MouseEvent) => {
    if (movedRef.current) return; // end of a pan, not a click
    e.stopPropagation();
    focusOn(focusRef.current === name ? "" : name);
  }, [focusOn, movedRef]);

  const onToggleOwned = useCallback((name: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!movedRef.current) toggle(name);
  }, [toggle, movedRef]);

  const sets = useMemo(() => focusSets(focus), [focus]);

  return (
    <div className={"graph" + (focus ? " has-panel" : "")}>
      <div id="gview" ref={viewRef} onClick={() => { if (!movedRef.current && layout && focus) focusOn(""); }}>
        <svg id="gsvg">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9 z" fill="context-stroke" />
            </marker>
          </defs>
          <g id="gworld" ref={worldRef}>
            {layout && (
              <>
                <g>
                  {layout.edges.map((e) => (
                    <path
                      key={e.id}
                      d={e.path}
                      className={"gedge" + (e.evolve ? " evolve" : "") + edgeHighlightClasses(e.source, e.target, sets)}
                      markerEnd="url(#arr)"
                      data-s={e.source}
                      data-t={e.target}
                    />
                  ))}
                </g>
                <g>
                  {layout.nodes.map((n) => {
                    const p = layout.positions[n];
                    if (!p) return null;
                    return (
                      <GraphNode
                        key={n}
                        name={n}
                        x={p.x}
                        y={p.y}
                        owned={isOwned(n)}
                        target={targetSet.has(n)}
                        highlight={nodeHighlightClasses(n, focus, sets)}
                        onSelect={onSelectNode}
                        onToggleOwned={onToggleOwned}
                      />
                    );
                  })}
                </g>
              </>
            )}
          </g>
        </svg>
        {!layout && <div id="gstatus">{status}</div>}
      </div>

      <GraphToolbar nodes={layout?.nodes ?? null} focus={focus} onFocusChange={focusOn} />
      <div className="gzoom" role="group" aria-label="Zoom">
        <button type="button" className="iconbtn" id="gzin" aria-label="Zoom in" title="Zoom in" onClick={() => zoomAtCenter(1.25)}><Icon name="plus" /></button>
        <button type="button" className="iconbtn" id="gzout" aria-label="Zoom out" title="Zoom out" onClick={() => zoomAtCenter(0.8)}><Icon name="minus" /></button>
        <button type="button" className="iconbtn" id="gfit" aria-label="Fit to screen" title="Fit to screen" onClick={refit}><Icon name="fit" /></button>
      </div>
      <div className="gkey" aria-hidden="true">
        <span><svg width="26" height="8"><path d="M1,4 H25" className="k-breed" /></svg>breeds into</span>
        <span><svg width="26" height="8"><path d="M1,4 H25" className="k-evolve" /></svg>evolves into</span>
        <span><i className="k-target" />on your list</span>
        {!focus && <span className="k-hint">Click a dragon for details</span>}
      </div>

      {focus && layout && (
        <GraphDetails name={focus} nodes={layout.nodes} onFocus={focusOn} onClose={() => focusOn("")} />
      )}
    </div>
  );
}
