import { describe, expect, it } from "vitest";
import { boundingBox, buildGraph, layoutGraph, NODE_HEIGHT, NODE_WIDTH } from "../src/components/graph/layout";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../src/data/targets";
import { edgeHighlightClasses, focusSets, nodeHighlightClasses } from "../src/components/graph/focus";

describe("graph layout", () => {
  it("builds one edge per specific ingredient, flagging evolutions", () => {
    const { nodes, edges } = buildGraph(EVENT_DRAGONS);
    expect(nodes).toHaveLength(135);
    expect(edges).toHaveLength(114);
    expect(buildGraph(DEFAULT_FAVORITES).nodes).toHaveLength(41);
    expect(buildGraph(DEFAULT_FAVORITES).edges).toHaveLength(33);
    expect(edges.find((e) => e.id === "Volcano→Muspel")?.evolve).toBe(true);
    expect(edges.find((e) => e.id === "Gift→Nibwhip")?.evolve).toBe(true);
    expect(edges.find((e) => e.id === "Zero→Magni")?.evolve).toBe(false);
  });

  it("lays out every node and edge with ELK", async () => {
    const layout = await layoutGraph(EVENT_DRAGONS);
    expect(Object.keys(layout.positions)).toHaveLength(135);
    expect(layout.edges).toHaveLength(114);
    expect(layout.edges[0]?.path).toMatch(/^M[\d.]+,[\d.]+( L[\d.]+,[\d.]+)+$/);
    expect(layout.width).toBeGreaterThan(NODE_WIDTH);
    const box = boundingBox(["Magni"], layout.positions);
    expect(box.w).toBe(NODE_WIDTH + 80);
    expect(box.h).toBe(NODE_HEIGHT + 80);
  }, 20_000);
});

describe("graph focus highlighting", () => {
  it("marks selected, downstream and unrelated nodes", () => {
    const sets = focusSets("Zero");
    expect(nodeHighlightClasses("Zero", "Zero", sets)).toBe(" sel");
    expect(nodeHighlightClasses("Magni", "Zero", sets)).toBe(" down");
    expect(nodeHighlightClasses("Thaw", "Zero", sets)).toBe(" down"); // via Cubicle's evolution
    expect(nodeHighlightClasses("Permafrost", "Zero", sets)).toBe("");
    expect(nodeHighlightClasses("Om", "Zero", sets)).toBe(" dim");
    expect(edgeHighlightClasses("Permafrost", "Zero", sets)).toBe(" hl");
    expect(edgeHighlightClasses("Zero", "Magni", sets)).toBe(" hl2");
    expect(edgeHighlightClasses("Lava", "Volcano", sets)).toBe(" dim");
    expect(focusSets("")).toBeNull();
  });
});
