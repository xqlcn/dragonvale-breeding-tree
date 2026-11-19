import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { ADULT_SPRITES_STORAGE_KEY, FAVORITES_STORAGE_KEY, LIST_SCOPE_STORAGE_KEY, OBTAINED_STORAGE_KEY } from "../src/config";

// Matched via dataset rather than a [data-name="…"] selector: jsdom's selector engine mis-handles "&" (Kraka & Krummi).
const card = (name: string) =>
  [...document.querySelectorAll<HTMLElement>(".card")].find((c) => c.dataset.name === name) ?? (null as unknown as HTMLElement);
const visibleCards = () => [...document.querySelectorAll<HTMLElement>(".card")].filter((c) => c.style.display !== "none").map((c) => c.dataset.name);
const stat = (i: number) => document.querySelectorAll(".stat")[i]!.textContent;

describe("Trees & prices tab", () => {
  it("renders every target card, shared ingredients and the price table", () => {
    render(<App />);
    expect(document.querySelectorAll(".card")).toHaveLength(11);
    expect(document.querySelectorAll("#shared .node").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("#tbl tbody tr")).toHaveLength(11);
    expect(stat(0)).toBe("0 / 11obtained");
    expect(stat(1)).toBe("193,822to buy the rest");
  });

  it("marking a dragon obtained updates every view, collapses its trees and persists", async () => {
    const user = userEvent.setup();
    render(<App />);
    const zeroItems = () => [...document.querySelectorAll<HTMLLIElement>('li[data-name="Zero"]')];
    expect(zeroItems().length).toBeGreaterThan(1); // under Magni and under Thaw → Cubicle
    const firstDetails = zeroItems()[0]!.querySelector(":scope > details") as HTMLDetailsElement;
    expect(firstDetails.open).toBe(true);

    await user.click(within(zeroItems()[0]!).getAllByTitle("Mark Zero as obtained")[0]!);

    expect(zeroItems().every((li) => li.classList.contains("owned"))).toBe(true);
    expect(zeroItems().every((li) => !(li.querySelector(":scope > details") as HTMLDetailsElement).open)).toBe(true);
    expect(document.querySelector('#shared .node[data-name="Zero"]')).toHaveClass("owned");
    expect(JSON.parse(localStorage.getItem(OBTAINED_STORAGE_KEY)!)).toEqual(["Zero"]);
  });

  it("target obtained toggle updates stats, table and owned filter", async () => {
    const user = userEvent.setup();
    render(<App />);
    const bigToggle = card("Magni").querySelector<HTMLButtonElement>("button.own.big")!;
    await user.click(bigToggle);
    expect(bigToggle).toHaveAttribute("aria-pressed", "true");
    expect(card("Magni")).toHaveClass("owned");
    expect(stat(0)).toBe("1 / 11obtained");
    expect(stat(1)).toBe("175,822to buy the rest (of 193,822)");
    expect(document.querySelector('#tbl tr[data-name="Magni"]')).toHaveClass("owned");

    await user.selectOptions(document.getElementById("ownf")!, "have");
    expect(visibleCards()).toEqual(["Magni"]);
    await user.selectOptions(document.getElementById("ownf")!, "need");
    expect(visibleCards()).toHaveLength(10);
  });

  it("restores obtained marks from localStorage", () => {
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Kitse"]');
    render(<App />);
    expect(card("Kitse")).toHaveClass("owned");
    expect(stat(0)).toBe("1 / 11obtained");
  });

  it("search matches anything in a tree and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByPlaceholderText(/Search dragons/);
    await user.type(search, "Zero");
    expect(visibleCards()).toEqual(["Magni", "Thaw"]);
    await user.clear(search);
    await user.type(search, "zzz");
    expect(visibleCards()).toEqual([]);
    expect(document.querySelector(".empty")).not.toHaveAttribute("hidden");
    expect(document.querySelector(".empty")).toHaveTextContent("No dragons match your search.");
  });

  it("sorts cards", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(document.getElementById("sort")!, "desc");
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Kraka & Krummi");
    await user.selectOptions(document.getElementById("sort")!, "az");
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Drak-E");
  });

  it("expand all / collapse all / clear obtained", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);
    await user.click(screen.getByText("Collapse all"));
    expect(document.querySelectorAll("#grid details[open]")).toHaveLength(0);
    await user.click(screen.getByText("Expand all"));
    expect(document.querySelectorAll("#grid details:not([open])")).toHaveLength(0);

    await user.click(screen.getByText("Clear obtained"));
    expect(confirmSpy).not.toHaveBeenCalled(); // nothing to clear yet

    await user.click(card("Magni").querySelector<HTMLButtonElement>("button.own.big")!);
    await user.click(screen.getByText("Clear obtained"));
    expect(confirmSpy).toHaveBeenCalledWith("Clear all obtained marks?");
    expect(card("Magni")).not.toHaveClass("owned");
    confirmSpy.mockRestore();
  });

  it("a buy / clone-only dragon shows that instead of a tree", () => {
    render(<App />);
    expect(card("Kraka & Krummi").querySelector(".formula")).toHaveTextContent("Buy / clone only");
    expect(card("Kraka & Krummi").querySelector(".tree")).toBeNull();
    expect(card("Kraka & Krummi")).toHaveTextContent("Can't be bred");
  });

  it("renders epic requirements as element rows, not as dragons", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Dazzling"]');
    render(<App />);
    const rows = [...card("Dazzling").querySelectorAll(".tree .elnode")];
    expect(rows.map((r) => r.textContent)).toEqual(["any Ornamental epic dragon", "any Ornamental epic dragon"]);
    expect(card("Dazzling").querySelector('[data-name="epic:Ornamental"]')).toBeNull();
  });
});

describe("tabs", () => {
  it("switches to the graph tab and mirrors it in the URL", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /Breeding graph/ }));
    expect(document.getElementById("tab-graph")).not.toHaveAttribute("hidden");
    expect(document.getElementById("tab-cards")).toHaveAttribute("hidden");
    expect(location.hash).toBe("#graph");
    expect(await screen.findAllByText("Magni", { selector: ".gnode text" }, { timeout: 15_000 })).toHaveLength(1);
    await user.click(screen.getByRole("tab", { name: /Trees & prices/ }));
    expect(location.hash).toBe("");
  }, 20_000);

  it("opens on the graph tab when the URL hash is #graph", () => {
    history.replaceState(null, "", "/#graph");
    render(<App />);
    expect(screen.getByRole("tab", { name: /Breeding graph/ })).toHaveAttribute("aria-selected", "true");
  });
});

describe("My list vs all event dragons", () => {
  const scopeButton = (scope: string) => document.querySelector<HTMLButtonElement>(`#scope [data-scope="${scope}"]`)!;

  it("starts on the default 11-dragon list and can switch to every event dragon", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(scopeButton("favorites")).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelectorAll(".card")).toHaveLength(11);

    await user.click(scopeButton("all"));
    expect(document.querySelectorAll(".card")).toHaveLength(111);
    expect(document.querySelectorAll("#tbl tbody tr")).toHaveLength(111);
    expect(stat(0)).toBe("0 / 111obtained");
    expect(stat(1)).toBe("834,022to buy the rest");
    expect(stat(3)).toBe("Reindeercheapest (675)");
    expect(localStorage.getItem(LIST_SCOPE_STORAGE_KEY)).toBe("all");
  });

  it("☆ adds a dragon to my list, ★ removes it, and the list is saved", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(scopeButton("all"));
    await user.click(card("Dancey").querySelector<HTMLButtonElement>("button.fav.big")!);
    expect(card("Dancey").querySelector("button.fav.big")).toHaveAttribute("aria-pressed", "true");
    expect(scopeButton("favorites")).toHaveTextContent("12");

    await user.click(scopeButton("favorites"));
    expect(document.querySelectorAll(".card")).toHaveLength(12);
    expect(visibleCards().at(-1)).toBe("Dancey"); // added to the end of "Your list order"
    expect(stat(0)).toBe("0 / 12obtained");
    expect(stat(2)).toBe("Kraka & Krummimost expensive (22,222)");
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toContain("Dancey");

    await user.click(card("Magni").querySelector<HTMLButtonElement>("button.fav.big")!);
    expect(card("Magni")).toBeNull();
    expect(document.querySelectorAll(".card")).toHaveLength(11);
  }, 15_000); // several re-renders of all 111 cards; slow when the suites run in parallel

  it("stats, price table and shared ingredients follow a saved custom list", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti","Jawny","Bogus"]');
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Jawny"]');
    render(<App />);
    expect(visibleCards()).toEqual(["Yeti", "Jawny"]); // unknown names are dropped
    expect(stat(0)).toBe("1 / 2obtained");
    expect(stat(1)).toBe("7,900to buy the rest (of 25,400)");
    expect([...document.querySelectorAll("#tbl tbody tr")].map((r) => r.getAttribute("data-name"))).toEqual(["Jawny", "Yeti"]);
    expect([...document.querySelectorAll("#shared .node")].map((n) => n.getAttribute("data-name"))).toEqual(["Coal", "Krampus", "Kringle", "Trinket"]);
  });

  it("an empty list shows guidance instead of cards, and reset restores the default", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    localStorage.setItem(FAVORITES_STORAGE_KEY, "[]");
    render(<App />);
    expect(document.querySelectorAll(".card")).toHaveLength(0);
    expect(document.querySelector(".empty")).toHaveTextContent(/Your list is empty/);
    expect(stat(0)).toBe("0 / 0obtained");
    expect(stat(2)).toBe("—most expensive");

    await user.click(document.getElementById("resetfav")!);
    expect(confirmSpy).toHaveBeenCalledWith("Reset My list to the default 11 dragons?");
    expect(document.querySelectorAll(".card")).toHaveLength(11);
    confirmSpy.mockRestore();
  });

  it("the graph only shows the active list's trees", async () => {
    const user = userEvent.setup();
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti"]');
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /Breeding graph/ }));
    await screen.findAllByText("Yeti", { selector: ".gnode text" }, { timeout: 15_000 });
    expect([...document.querySelectorAll(".gnode")].map((g) => g.getAttribute("data-n")).sort()).toEqual(["Coal", "Krampus", "Kringle", "Trinket", "Yeti"]);
    expect(document.querySelector('.gnode[data-n="Yeti"]')).toHaveClass("target");
    expect(document.querySelector('.gnode[data-n="Coal"]')).not.toHaveClass("target");

    await user.click(scopeButton("all"));
    await waitFor(() => expect(document.querySelectorAll(".gnode")).toHaveLength(135), { timeout: 15_000 });
    expect(document.querySelector('.gnode[data-n="Coal"]')).toHaveClass("target");
  }, 30_000);
});

describe("adult sprites switch", () => {
  const headSprite = (name: string) => card(name).querySelector<HTMLImageElement>(".card-head img")!;

  it("switches Trees & prices pictures to adults (baby where there's no adult art) and remembers it", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(headSprite("Magni").src).toBe("https://dvboxcdn.com/dragons/Magni.webp");

    await user.click(document.getElementById("adults")!);
    expect(document.getElementById("adults")).toHaveAttribute("aria-pressed", "true");
    expect(headSprite("Magni").src).toMatch(/static\.wikia\.nocookie\.net\/dragonvale\/images\/.+\/MagniDragonAdult\.png\//);
    expect(headSprite("Magni")).toHaveClass("r-rare", "adult");
    expect(headSprite("Muspel").src).toBe("https://dvboxcdn.com/dragons/Muspel.webp"); // no adult art yet
    expect(document.querySelector<HTMLImageElement>('#tbl tr[data-name="Magni"] img')!.src).toMatch(/MagniDragonAdult/);
    expect(localStorage.getItem(ADULT_SPRITES_STORAGE_KEY)).toBe("1");

    await user.click(document.getElementById("adults")!);
    expect(headSprite("Magni").src).toBe("https://dvboxcdn.com/dragons/Magni.webp");
  });

  it("does not change the breeding graph", async () => {
    localStorage.setItem(ADULT_SPRITES_STORAGE_KEY, "1");
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti"]');
    const user = userEvent.setup();
    render(<App />);
    expect(headSprite("Yeti").src).toMatch(/YetiDragonAdult/);
    await user.click(screen.getByRole("tab", { name: /Breeding graph/ }));
    await screen.findAllByText("Yeti", { selector: ".gnode text" }, { timeout: 15_000 });
    expect(document.querySelector('.gnode[data-n="Yeti"] image')).toHaveAttribute("href", "https://dvboxcdn.com/dragons/Yeti.webp");
  }, 20_000);
});

describe("Edit my list (bulk checklist)", () => {
  const favCount = () => document.querySelector('#scope [data-scope="favorites"] .count')!.textContent;
  const editor = () => document.getElementById("leditor")!;

  it("select all / clear all / section boxes / single boxes all update My list", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.getElementById("leditor")).toBeNull();
    await user.click(document.getElementById("editlist")!);
    expect(editor().querySelectorAll(".litem")).toHaveLength(111);

    await user.click(within(editor()).getByText("Clear all"));
    expect(favCount()).toBe("0");
    expect(document.querySelectorAll(".card")).toHaveLength(0);

    await user.click(within(editor()).getByLabelText("All Limited dragons"));
    expect(favCount()).toBe("3");
    expect(visibleCards()).toEqual(["Magni", "Muspel", "Kraka & Krummi"]);

    const kitse = editor().querySelector<HTMLInputElement>('.litem[data-name="Kitse"] input')!;
    await user.click(kitse);
    expect(kitse.checked).toBe(true);
    expect(visibleCards().at(-1)).toBe("Kitse");
    const branching = within(editor()).getByLabelText<HTMLInputElement>("All Branching dragons");
    expect(branching.indeterminate).toBe(true);

    await user.click(within(editor()).getByText("Select all"));
    expect(favCount()).toBe("111");
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toHaveLength(111);
  }, 20_000);

  it("the filter limits the checklist and Select all / Clear all to what's shown", async () => {
    const user = userEvent.setup();
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Magni"]');
    render(<App />);
    await user.click(document.getElementById("editlist")!);
    await user.type(within(editor()).getByLabelText("Filter dragons"), "snowflake");
    expect(editor().querySelectorAll(".litem")).toHaveLength(7);
    await user.click(within(editor()).getByText("Select all shown"));
    expect(favCount()).toBe("8");
    await user.click(within(editor()).getByText("Clear all shown"));
    expect(favCount()).toBe("1");
    await user.click(within(editor()).getByText("Done"));
    expect(document.getElementById("leditor")).toBeNull();
  });
});
