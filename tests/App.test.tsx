import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { ADULT_SPRITES_STORAGE_KEY, FAVORITES_STORAGE_KEY, LIST_SCOPE_STORAGE_KEY, OBTAINED_STORAGE_KEY } from "../src/config";

// Cards are matched via dataset rather than a [data-name="…"] selector: jsdom's selector engine mis-handles "&" (Kraka & Krummi).
const card = (name: string) =>
  [...document.querySelectorAll<HTMLElement>(".card")].find((c) => c.dataset.name === name) ?? (null as unknown as HTMLElement);
const visibleCards = () => [...document.querySelectorAll<HTMLElement>(".card")].filter((c) => c.style.display !== "none").map((c) => c.dataset.name);
const sum = (id: "sum-progress" | "sum-cost" | "sum-ready") => document.getElementById(id)!.textContent;
const select = (id: "sort" | "show") => document.getElementById(id) as HTMLSelectElement;
const tableRows = () => [...document.querySelectorAll("#tbl tbody tr[data-name]")].map((r) => r.getAttribute("data-name"));

describe("Trees view", () => {
  it("renders the list's cards, key parents and the summary", () => {
    render(<App />);
    expect(document.querySelectorAll(".card")).toHaveLength(11);
    expect(document.querySelectorAll("#shared .kp").length).toBeGreaterThan(0);
    expect(sum("sum-progress")).toBe("Obtained0 of 11");
    expect(sum("sum-cost")).toContain("193,822");
    expect(sum("sum-ready")).toContain("1"); // Om: elements only
  });

  it("trees start at the parents; a parent row expands, and collapses once obtained", async () => {
    const user = userEvent.setup();
    render(<App />);
    const magni = card("Magni");
    expect([...magni.querySelectorAll(":scope .card-tree > ul > li")].map((li) => li.getAttribute("data-name"))).toEqual(["Zero", "Fulgurite"]);
    expect(magni.querySelector('li[data-name="Permafrost"]')).toBeNull();

    await user.click(within(magni).getByText("Zero"));
    expect(magni.querySelector('li[data-name="Permafrost"]')).not.toBeNull();

    await user.click(within(magni.querySelector('li[data-name="Zero"]')!).getAllByLabelText("Mark Zero as obtained")[0]!);
    expect(magni.querySelector('li[data-name="Zero"]')).toHaveClass("owned");
    expect((magni.querySelector('li[data-name="Zero"] > details') as HTMLDetailsElement).open).toBe(false);
    expect(document.querySelector('#shared .kp[data-name="Zero"]')).toHaveClass("owned");
    expect(JSON.parse(localStorage.getItem(OBTAINED_STORAGE_KEY)!)).toEqual(["Zero"]);
  });

  it("element requirements share one row; buy / clone-only dragons say so", () => {
    render(<App />);
    expect(card("Drak-E").querySelector(".req-row")).toHaveTextContent("plusmetalcold");
    expect(card("Om").querySelector(".req-row")).toHaveTextContent("any parents withlightningwaterlight");
    expect(card("Kraka & Krummi").querySelector(".tree")).toBeNull();
    expect(card("Kraka & Krummi")).toHaveTextContent("Can't be bred");
  });

  it("repeated epic requirements are counted", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Dazzling"]');
    render(<App />);
    expect(card("Dazzling").querySelector(".req-row")).toHaveTextContent("any parents with2× Ornamental epic");
  });

  it("the card's check updates the summary, the table and the Show filter", async () => {
    const user = userEvent.setup();
    render(<App />);
    const check = card("Magni").querySelector<HTMLButtonElement>("button.own.lg")!;
    await user.click(check);
    expect(check).toHaveAttribute("aria-pressed", "true");
    expect(card("Magni")).toHaveClass("owned");
    expect(sum("sum-progress")).toBe("Obtained1 of 11");
    expect(sum("sum-cost")).toContain("175,822");
    expect(sum("sum-cost")).toContain("of 193,822");
    expect(document.querySelector('#tbl tr[data-name="Magni"]')).toHaveClass("owned");

    await user.selectOptions(select("show"), "have");
    expect(visibleCards()).toEqual(["Magni"]);
    await user.selectOptions(select("show"), "need");
    expect(visibleCards()).toHaveLength(10);
  });

  it("restores obtained marks from localStorage", () => {
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Kitse"]');
    render(<App />);
    expect(card("Kitse")).toHaveClass("owned");
    expect(sum("sum-progress")).toBe("Obtained1 of 11");
  });

  it("Ready to breed: counted in the summary, clicking it filters to them", async () => {
    const user = userEvent.setup();
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Yeti"]');
    render(<App />);
    expect(sum("sum-ready")).toContain("2");
    expect(card("Jawny").querySelector(".fact.good")).toHaveTextContent("Ready to breed");
    expect(document.getElementById("clearfilters")).toBeNull();
    await user.click(document.getElementById("sum-ready")!);
    expect(select("show").value).toBe("ready");
    expect(document.getElementById("sum-ready")).toHaveAttribute("aria-pressed", "true");
    expect(visibleCards()).toEqual(["Jawny", "Om"]);

    // Way back #1: click the card again.
    await user.click(document.getElementById("sum-ready")!);
    expect(select("show").value).toBe("all");
    expect(visibleCards()).toHaveLength(11);

    // Way back #2: the toolbar's Clear button (also clears the search).
    await user.click(document.getElementById("sum-ready")!);
    await user.type(screen.getByLabelText("Search dragons or parents"), "yeti");
    await user.click(document.getElementById("clearfilters")!);
    expect(select("show").value).toBe("all");
    expect((document.getElementById("q") as HTMLInputElement).value).toBe("");
    expect(visibleCards()).toHaveLength(11);
    expect(document.getElementById("clearfilters")).toBeNull();
  });

  it("search matches anything in a tree and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByLabelText("Search dragons or parents");
    await user.type(search, "Zero");
    expect(visibleCards()).toEqual(["Magni", "Thaw"]);
    await user.clear(search);
    await user.type(search, "zzz");
    expect(visibleCards()).toEqual([]);
    expect(document.querySelector("#grid .empty")).not.toHaveAttribute("hidden");
    expect(document.querySelector("#grid .empty")).toHaveTextContent("No dragons match your search.");
  });

  it("a key parent shows the dragons that need it; clicking again clears", async () => {
    const user = userEvent.setup();
    render(<App />);
    const zero = document.querySelector<HTMLButtonElement>('#shared .kp[data-name="Zero"]')!;
    await user.click(zero);
    expect(zero).toHaveAttribute("aria-pressed", "true");
    expect(visibleCards()).toEqual(["Magni", "Thaw"]);
    await user.click(zero);
    expect(visibleCards()).toHaveLength(11);
  });

  it("sorts cards", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(select("sort"), "desc");
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Kraka & Krummi");
    await user.selectOptions(select("sort"), "az");
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Drak-E");
  });

  it("Reset progress in the footer clears obtained marks after confirming", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);
    await user.click(document.getElementById("resetprogress")!);
    expect(confirmSpy).not.toHaveBeenCalled(); // nothing to clear yet
    await user.click(card("Magni").querySelector<HTMLButtonElement>("button.own.lg")!);
    await user.click(document.getElementById("resetprogress")!);
    expect(confirmSpy).toHaveBeenCalledWith("Clear every obtained mark?");
    expect(card("Magni")).not.toHaveClass("owned");
    confirmSpy.mockRestore();
  });
});

describe("Table view", () => {
  it("lists the same dragons with the same search / show, plus totals", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Table" }));
    expect(location.hash).toBe("#table");
    expect(document.getElementById("view-table")).not.toHaveAttribute("hidden");
    expect(tableRows()).toHaveLength(11);
    expect(document.querySelector("#tbl tfoot")).toHaveTextContent("193,822");
    await user.type(screen.getByLabelText("Search dragons or parents"), "Zero");
    expect(tableRows()).toEqual(["Magni", "Thaw"]);
    await user.selectOptions(select("sort"), "desc");
    expect(tableRows()).toEqual(["Magni", "Thaw"]); // both 18,000 / 17,000
  });

  it("opens on the table when the URL hash is #table", () => {
    history.replaceState(null, "", "/#table");
    render(<App />);
    expect(screen.getByRole("tab", { name: "Table" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Graph view", () => {
  it("switches to the graph and mirrors it in the URL", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Graph" }));
    expect(document.getElementById("view-graph")).not.toHaveAttribute("hidden");
    expect(document.getElementById("view-trees")).toHaveAttribute("hidden");
    expect(location.hash).toBe("#graph");
    expect(document.getElementById("q")).toBeNull(); // the Trees / Table controls are hidden
    expect(await screen.findAllByText("Magni", { selector: ".gnode text" }, { timeout: 15_000 })).toHaveLength(1);
    await user.click(screen.getByRole("tab", { name: "Trees" }));
    expect(location.hash).toBe("");
  }, 20_000);

  it("clicking a dragon opens its details; chips move between dragons; actions work", async () => {
    const user = userEvent.setup();
    history.replaceState(null, "", "/#graph");
    render(<App />);
    await screen.findAllByText("Zero", { selector: ".gnode text" }, { timeout: 15_000 });
    await user.click(document.querySelector('.gnode[data-n="Zero"] rect.box')!);
    const panel = () => document.getElementById("gpanel")!;
    expect(panel()).toHaveTextContent("Zero");
    expect([...panel().querySelectorAll("button.chip")].map((c) => c.textContent)).toEqual(["Permafrost", "Snowpocalypse", "Magni", "Cubicle"]);
    expect(document.querySelector('.gnode[data-n="Magni"]')).toHaveClass("down");
    expect(document.querySelector('.gnode[data-n="Om"]')).toHaveClass("dim");

    await user.click(within(panel()).getByRole("button", { name: /Mark obtained/ }));
    expect(document.querySelector('.gnode[data-n="Zero"]')).toHaveClass("owned");

    await user.click(within(panel()).getByRole("button", { name: "Magni" }));
    expect(panel()).toHaveTextContent("Magni");
    expect((document.getElementById("gfocus") as HTMLInputElement).value).toBe("Magni");

    await user.click(within(panel()).getByLabelText("Close details"));
    expect(document.getElementById("gpanel")).toBeNull();
  }, 20_000);

  it("the find box selects a dragon by name", async () => {
    const user = userEvent.setup();
    history.replaceState(null, "", "/#graph");
    render(<App />);
    await screen.findAllByText("Yeti", { selector: ".gnode text" }, { timeout: 15_000 });
    await user.type(screen.getByLabelText("Find a dragon in the graph"), "yeti");
    expect(document.getElementById("gpanel")).toHaveTextContent("Yeti");
    expect(document.querySelector('.gnode[data-n="Yeti"]')).toHaveClass("sel");
  }, 20_000);
});

describe("My list vs all dragons", () => {
  const scopeButton = (scope: string) => document.querySelector<HTMLButtonElement>(`#scope [data-scope="${scope}"]`)!;

  it("starts on the default 11-dragon list and can switch to every event dragon", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(scopeButton("favorites")).toHaveAttribute("aria-pressed", "true");
    await user.click(scopeButton("all"));
    expect(document.querySelectorAll(".card")).toHaveLength(111);
    expect(tableRows()).toHaveLength(111);
    expect(sum("sum-progress")).toBe("Obtained0 of 111");
    expect(sum("sum-cost")).toContain("834,022");
    expect(localStorage.getItem(LIST_SCOPE_STORAGE_KEY)).toBe("all");
  }, 15_000);

  it("the star adds a dragon to my list or removes it, and the list is saved", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(scopeButton("all"));
    await user.click(card("Dancey").querySelector<HTMLButtonElement>("button.fav.lg")!);
    expect(card("Dancey").querySelector("button.fav.lg")).toHaveAttribute("aria-pressed", "true");
    expect(scopeButton("favorites")).toHaveTextContent("12");

    await user.click(scopeButton("favorites"));
    expect(document.querySelectorAll(".card")).toHaveLength(12);
    expect(visibleCards().at(-1)).toBe("Dancey");
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toContain("Dancey");

    await user.click(card("Magni").querySelector<HTMLButtonElement>("button.fav.lg")!);
    expect(card("Magni")).toBeNull();
    expect(document.querySelectorAll(".card")).toHaveLength(11);
  }, 15_000);

  it("summary, table and key parents follow a saved custom list", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti","Jawny","Bogus"]');
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Jawny"]');
    render(<App />);
    expect(visibleCards()).toEqual(["Yeti", "Jawny"]); // unknown names are dropped
    expect(sum("sum-progress")).toBe("Obtained1 of 2");
    expect(sum("sum-cost")).toContain("7,900");
    expect(sum("sum-cost")).toContain("of 25,400");
    expect(tableRows()).toEqual(["Yeti", "Jawny"]);
    expect([...document.querySelectorAll("#shared .kp")].map((n) => n.getAttribute("data-name"))).toEqual(["Coal", "Krampus", "Kringle", "Trinket"]);
  });

  it("an empty list explains what to do, and Reset my list restores the default", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    localStorage.setItem(FAVORITES_STORAGE_KEY, "[]");
    render(<App />);
    expect(document.querySelectorAll(".card")).toHaveLength(0);
    expect(document.querySelector("#grid .empty")).toHaveTextContent(/Your list is empty/);
    expect(sum("sum-progress")).toBe("Obtained0 of 0");

    await user.click(document.getElementById("resetfav")!);
    expect(confirmSpy).toHaveBeenCalledWith("Reset My list to the default 11 dragons?");
    expect(document.querySelectorAll(".card")).toHaveLength(11);
    confirmSpy.mockRestore();
  });

  it("the graph only shows the active list's trees", async () => {
    const user = userEvent.setup();
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti"]');
    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Graph" }));
    await screen.findAllByText("Yeti", { selector: ".gnode text" }, { timeout: 15_000 });
    expect([...document.querySelectorAll(".gnode")].map((g) => g.getAttribute("data-n")).sort()).toEqual(["Coal", "Krampus", "Kringle", "Trinket", "Yeti"]);
    expect(document.querySelector('.gnode[data-n="Yeti"]')).toHaveClass("target");
    expect(document.querySelector('.gnode[data-n="Coal"]')).not.toHaveClass("target");

    await user.click(scopeButton("all"));
    await waitFor(() => expect(document.querySelectorAll(".gnode")).toHaveLength(135), { timeout: 15_000 });
    expect(document.querySelector('.gnode[data-n="Coal"]')).toHaveClass("target");
  }, 30_000);
});

describe("Baby / Adult pictures", () => {
  const headSprite = (name: string) => card(name).querySelector<HTMLImageElement>(".card-head img")!;

  it("switches Trees and Table pictures to adults (baby where there's no adult art) and remembers it", async () => {
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

    await user.click(document.getElementById("babies")!);
    expect(headSprite("Magni").src).toBe("https://dvboxcdn.com/dragons/Magni.webp");
  });

  it("does not change the graph", async () => {
    localStorage.setItem(ADULT_SPRITES_STORAGE_KEY, "1");
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Yeti"]');
    const user = userEvent.setup();
    render(<App />);
    expect(headSprite("Yeti").src).toMatch(/YetiDragonAdult/);
    await user.click(screen.getByRole("tab", { name: "Graph" }));
    await screen.findAllByText("Yeti", { selector: ".gnode text" }, { timeout: 15_000 });
    expect(document.querySelector('.gnode[data-n="Yeti"] image')).toHaveAttribute("href", "https://dvboxcdn.com/dragons/Yeti.webp");
  }, 20_000);
});

describe("Edit list (bulk checklist)", () => {
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
    expect(within(editor()).getByLabelText<HTMLInputElement>("All Branching dragons").indeterminate).toBe(true);

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
