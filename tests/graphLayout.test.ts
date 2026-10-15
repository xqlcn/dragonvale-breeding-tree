import { describe, expect, it } from "vitest";
import { boundingBox, buildGraph, layoutGraph, NODE_HEIGHT, NODE_WIDTH } from "../src/components/graph/layout";
import { DEFAULT_FAVORITES, EVENT_DRAGONS } from "../src/data/targets";
import { edgeHighlightClasses, focusSets, nodeHighlightClasses } from "../src/components/graph/focus";

describe("graph layout", () => {
  it("builds one edge per specific ingredient, flagging evolutions", () => {
    const { nodes, edges } = buildGraph(EVENT_DRAGONS);
    expect(nodes).toHaveLength(145);
    expect(edges).toHaveLength(142);
    expect(buildGraph(DEFAULT_FAVORITES).nodes).toHaveLength(57);
    expect(buildGraph(DEFAULT_FAVORITES).edges).toHaveLength(53);
    expect(edges.find((e) => e.id === "Love→Wrath")?.evolve).toBe(true);
    expect(edges.find((e) => e.id === "Scourge→Reaper")?.evolve).toBe(false);
  });

  it("lays out every node and edge with ELK", async () => {
    const layout = await layoutGraph(EVENT_DRAGONS);
    expect(Object.keys(layout.positions)).toHaveLength(145);
    expect(layout.edges).toHaveLength(142);
    expect(layout.edges[0]?.path).toMatch(/^M[\d.]+,[\d.]+( L[\d.]+,[\d.]+)+$/);
    expect(layout.width).toBeGreaterThan(NODE_WIDTH);
    const box = boundingBox(["Reaper"], layout.positions);
    expect(box.w).toBe(NODE_WIDTH + 80);
    expect(box.h).toBe(NODE_HEIGHT + 80);
  }, 20_000);
});

describe("graph focus highlighting", () => {
  it("marks selected, downstream and unrelated nodes", () => {
    const sets = focusSets("Scourge");
    expect(nodeHighlightClasses("Scourge", "Scourge", sets)).toBe(" sel");
    expect(nodeHighlightClasses("Reaper", "Scourge", sets)).toBe(" down");
    expect(nodeHighlightClasses("Decay", "Scourge", sets)).toBe("");
    expect(nodeHighlightClasses("Kwall", "Scourge", sets)).toBe(" dim");
    expect(edgeHighlightClasses("Decay", "Scourge", sets)).toBe(" hl");
    expect(edgeHighlightClasses("Scourge", "Reaper", sets)).toBe(" hl2");
    expect(edgeHighlightClasses("Bone", "Wendigo", sets)).toBe(" dim");
    expect(focusSets("")).toBeNull();
  });
});
