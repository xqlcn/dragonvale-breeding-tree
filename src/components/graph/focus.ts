import { downstreamOf, upstreamOf } from "../../lib/breeding";

/** Highlight sets for a focused dragon: what it needs (upstream) and what uses it (downstream). */
export interface FocusSets { upstream: Set<string>; downstream: Set<string>; related: Set<string> }

export function focusSets(name: string): FocusSets | null {
  if (!name) return null;
  const upstream = upstreamOf(name);
  const downstream = downstreamOf(name);
  return { upstream, downstream, related: new Set([...upstream, ...downstream]) };
}

export function nodeHighlightClasses(name: string, focus: string, sets: FocusSets | null): string {
  if (!sets) return "";
  let cls = "";
  if (!sets.related.has(name)) cls += " dim";
  if (name === focus) cls += " sel";
  if (name !== focus && sets.downstream.has(name)) cls += " down";
  return cls;
}

export function edgeHighlightClasses(source: string, target: string, sets: FocusSets | null): string {
  if (!sets) return "";
  const up = sets.upstream.has(source) && sets.upstream.has(target);
  const down = sets.downstream.has(source) && sets.downstream.has(target);
  return (up ? " hl" : "") + (down ? " hl2" : "") + (!up && !down ? " dim" : "");
}

/**
 * "Ready to breed" spotlight, used while no dragon is selected: ready dragons and their direct parents
 * (which you own, by definition) stay lit, everything else is dimmed.
 */
export interface ReadySets { ready: ReadonlySet<string>; parents: ReadonlySet<string> }

export function readyNodeClasses(name: string, sets: ReadySets | null): string {
  if (!sets) return "";
  return sets.ready.has(name) || sets.parents.has(name) ? "" : " dim";
}

export function readyEdgeClasses(target: string, sets: ReadySets | null): string {
  if (!sets) return "";
  return sets.ready.has(target) ? " rdy" : " dim";
}
