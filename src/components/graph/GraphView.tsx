import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { usedBy } from "../../lib/breeding";
import { labelOf } from "../../lib/ingredients";
import { useObtained } from "../../state/ObtainedContext";
import { useTargetList } from "../../state/TargetListContext";
import { edgeHighlightClasses, focusSets, nodeHighlightClasses } from "./focus";
import { GraphLegend } from "./GraphLegend";
import { GraphNode } from "./GraphNode";
import { GraphToolbar } from "./GraphToolbar";
import { boundingBox, layoutGraph, type Box, type GraphLayout } from "./layout";
import { usePanZoom } from "./usePanZoom";

/**
 * "Breeding graph" tab for the active list. The layout is computed lazily while the tab is `active`,
 * once per distinct list (cached), and the graph stays mounted (just hidden) so pan/zoom/focus survive
 * tab switches.
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
    if (!targets.length) { setStatus("Your list is empty. Switch to “All event dragons” and press ☆ on a card to add dragons."); return; }
    let cancelled = false;
    setStatus("Laying out graph…");
    layoutGraph(targets).then(
      (l) => { if (!cancelled) setLayouts((m) => new Map(m).set(listKey, l)); },
      (err: Error) => { if (!cancelled) setStatus(err.message); },
    );
    return () => { cancelled = true; };
  }, [active, listKey, targets, layouts]);

  // Drop the highlight when its dragon isn't in the current list's graph.
  useEffect(() => {
    if (layout && focus && !layout.nodes.includes(focus)) setFocus("");
  }, [layout, focus]);

  const targetSet = useMemo(() => new Set(targets), [targets]);

  const fullBox = useCallback((l: GraphLayout): Box => ({ x: 0, y: 0, w: l.width, h: l.height }), []);

  /** Sets (or clears) the focused dragon; `zoom` also frames everything related to it. */
  const focusOn = useCallback((name: string, zoom = false) => {
    setFocus(name);
    const sets = focusSets(name);
    if (zoom && sets && layout) fit(boundingBox(sets.related, layout.positions));
  }, [fit, layout]);

  /** Fit button / window resize: frame the focused subgraph, or the whole graph. */
  const refit = useCallback(() => {
    if (!layout) return;
    if (focusRef.current) focusOn(focusRef.current, true);
    else fit(fullBox(layout));
  }, [layout, focusOn, fit, fullBox]);

  // Fit the whole graph when it first appears and every time the tab is re-opened.
  useLayoutEffect(() => {
    if (active && layout) fit(fullBox(layout));
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
    <>
      <GraphToolbar
        nodes={layout?.nodes ?? null}
        targets={targets}
        focus={focus}
        onFocusChange={(n) => focusOn(n, true)}
        onZoomIn={() => zoomAtCenter(1.25)}
        onZoomOut={() => zoomAtCenter(0.8)}
        onFit={refit}
      />
      <GraphLegend />
      <div id="ginfo">{layout && <FocusInfo focus={focus} nodes={layout.nodes} />}</div>
      <div id="gview" ref={viewRef} onClick={() => { if (!movedRef.current && layout) focusOn(""); }}>
        <svg id="gsvg">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
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
    </>
  );
}

function FocusInfo({ focus, nodes }: { focus: string; nodes: readonly string[] }) {
  if (!focus) return null;
  const used = usedBy(focus).filter((n) => nodes.includes(n)).map(labelOf);
  return (
    <>
      <b>{labelOf(focus)}</b>: <span style={{ color: "var(--accent)" }}>orange</span> = what you need to breed it
      {used.length ? (
        <> · <span style={{ color: "var(--cold)" }}>blue</span> = what it's used for (directly: {used.join(", ")})</>
      ) : (
        " · not used to breed any other dragon here"
      )}
    </>
  );
}
