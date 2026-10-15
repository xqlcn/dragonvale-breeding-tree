import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import { DRAGONS } from "../../data/dragons";
import { allTreeDragons, dragonRequirementsOf } from "../../lib/breeding";

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 82;

export interface GraphEdge { id: string; source: string; target: string; /** dashed "evolves into" edge */ evolve: boolean }
export interface PositionedEdge extends GraphEdge { path: string }
export interface Point { x: number; y: number }
export interface Box { x: number; y: number; w: number; h: number }

export interface GraphLayout {
  nodes: string[];
  positions: Record<string, Point>;
  edges: PositionedEdge[];
  width: number;
  height: number;
}

/** ELK "layered" layout, left → right, orthogonal edges. Tuned for ~60–150 nodes of NODE_WIDTH×NODE_HEIGHT. */
const LAYOUT_OPTIONS: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "22",
  "elk.layered.spacing.edgeNodeBetweenLayers": "20",
  "elk.spacing.edgeEdge": "10",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.padding": "[top=30,left=30,bottom=30,right=30]",
};

/** Nodes = every dragon in any target's tree; edges = ingredient → dragon it breeds/evolves into. */
export function buildGraph(targets: readonly string[]): { nodes: string[]; edges: GraphEdge[] } {
  const nodes = allTreeDragons(targets);
  const edges: GraphEdge[] = [];
  for (const n of nodes) {
    for (const c of dragonRequirementsOf(n)) {
      edges.push({ id: `${c}→${n}`, source: c, target: n, evolve: !!DRAGONS[n]?.evolvesFrom });
    }
  }
  return { nodes, edges };
}

/**
 * Lays out the breeding graph. ELK (~1.4 MB) is code-split and only downloaded
 * the first time the graph tab is opened.
 */
export async function layoutGraph(targets: readonly string[]): Promise<GraphLayout> {
  const { nodes, edges } = buildGraph(targets);
  let ElkCtor: typeof import("elkjs/lib/elk.bundled.js").default;
  try {
    ElkCtor = (await import("elkjs/lib/elk.bundled.js")).default;
  } catch {
    throw new Error("Couldn't load the graph layout library.");
  }
  const graph: ElkNode = {
    id: "root",
    layoutOptions: LAYOUT_OPTIONS,
    children: nodes.map((id) => ({ id, width: NODE_WIDTH, height: NODE_HEIGHT })),
    edges: edges.map((e): ElkExtendedEdge => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  };
  let res: ElkNode;
  try {
    res = await new ElkCtor().layout(graph);
  } catch (err) {
    throw new Error(`Graph layout failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const positions: Record<string, Point> = {};
  for (const c of res.children ?? []) positions[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };

  const sectionsById = new Map((res.edges ?? []).map((e) => [e.id, (e as ElkExtendedEdge).sections?.[0]]));
  const positioned: PositionedEdge[] = [];
  for (const e of edges) {
    const sec = sectionsById.get(e.id);
    if (!sec) continue;
    const pts = [sec.startPoint, ...(sec.bendPoints ?? []), sec.endPoint];
    positioned.push({ ...e, path: pts.map((p, j) => `${j ? "L" : "M"}${p.x},${p.y}`).join(" ") });
  }
  return { nodes, positions, edges: positioned, width: res.width ?? 0, height: res.height ?? 0 };
}

/** Bounding box (with margin) around a set of laid-out nodes. */
export function boundingBox(names: Iterable<string>, positions: Record<string, Point>, margin = 40): Box {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const m of names) {
    const p = positions[m];
    if (!p) continue;
    x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y);
    x2 = Math.max(x2, p.x + NODE_WIDTH); y2 = Math.max(y2, p.y + NODE_HEIGHT);
  }
  return { x: x1 - margin, y: y1 - margin, w: x2 - x1 + 2 * margin, h: y2 - y1 + 2 * margin };
}
