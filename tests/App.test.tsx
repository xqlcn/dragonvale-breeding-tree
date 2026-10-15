import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { FAVORITES_STORAGE_KEY, LIST_SCOPE_STORAGE_KEY, OBTAINED_STORAGE_KEY } from "../src/config";

const card = (name: string) => document.querySelector<HTMLElement>(`.card[data-name="${name}"]`)!;
const visibleCards = () => [...document.querySelectorAll<HTMLElement>(".card")].filter((c) => c.style.display !== "none").map((c) => c.dataset.name);
const stat = (i: number) => document.querySelectorAll(".stat")[i]!.textContent;

describe("Trees & prices tab", () => {
  it("renders every target card, shared ingredients and the price table", () => {
    render(<App />);
    expect(document.querySelectorAll(".card")).toHaveLength(23);
    expect(document.querySelectorAll("#shared .node").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("#tbl tbody tr")).toHaveLength(23);
    expect(stat(0)).toBe("0 / 23obtained");
    expect(stat(1)).toBe("236,720to buy the rest");
  });

  it("marking a dragon obtained updates every view, collapses its trees and persists", async () => {
    const user = userEvent.setup();
    render(<App />);
    const scourgeItems = () => [...document.querySelectorAll<HTMLLIElement>('li[data-name="Scourge"]')];
    const firstDetails = scourgeItems()[0]!.querySelector(":scope > details") as HTMLDetailsElement;
    expect(firstDetails.open).toBe(true);

    await user.click(within(scourgeItems()[0]!).getAllByTitle("Mark Scourge as obtained")[0]!);

    expect(scourgeItems().every((li) => li.classList.contains("owned"))).toBe(true);
    expect(scourgeItems().every((li) => !(li.querySelector(":scope > details") as HTMLDetailsElement).open)).toBe(true);
    expect(document.querySelector('#shared .node[data-name="Scourge"]')).toHaveClass("owned");
    expect(JSON.parse(localStorage.getItem(OBTAINED_STORAGE_KEY)!)).toEqual(["Scourge"]);
  });

  it("target obtained toggle updates stats, table and owned filter", async () => {
    const user = userEvent.setup();
    render(<App />);
    const bigToggle = card("Reaper").querySelector<HTMLButtonElement>("button.own.big")!;
    await user.click(bigToggle);
    expect(bigToggle).toHaveAttribute("aria-pressed", "true");
    expect(card("Reaper")).toHaveClass("owned");
    expect(stat(0)).toBe("1 / 23obtained");
    expect(stat(1)).toBe("221,720to buy the rest (of 236,720)");
    expect(document.querySelector('#tbl tr[data-name="Reaper"]')).toHaveClass("owned");

    await user.selectOptions(document.getElementById("ownf")!, "have");
    expect(visibleCards()).toEqual(["Reaper"]);
    await user.selectOptions(document.getElementById("ownf")!, "need");
    expect(visibleCards()).toHaveLength(22);
  });

  it("restores obtained marks from localStorage", () => {
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Awoo"]');
    render(<App />);
    expect(card("Awoo")).toHaveClass("owned");
    expect(stat(0)).toBe("1 / 23obtained");
  });

  it("search matches anything in a tree and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByPlaceholderText(/Search dragons/);
    await user.type(search, "Scourge");
    expect(visibleCards()).toEqual(["Reaper", "Dracomancy", "Exterrean"]);
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
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Exterrean");
    await user.selectOptions(document.getElementById("sort")!, "az");
    expect(document.querySelector(".card")).toHaveAttribute("data-name", "Awoo");
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

    await user.click(card("Reaper").querySelector<HTMLButtonElement>("button.own.big")!);
    await user.click(screen.getByText("Clear obtained"));
    expect(confirmSpy).toHaveBeenCalledWith("Clear all obtained marks?");
    expect(card("Reaper")).not.toHaveClass("owned");
    confirmSpy.mockRestore();
  });

  it("renders 'special' requirements as a rainbow element row, not as a dragon (bug fix)", () => {
    render(<App />);
    const rainbow = card("Corrupticorn").querySelector('li[data-name="Rainbow"]')!;
    expect(rainbow.querySelector('[data-name="special:4"]')).toBeNull();
    expect(rainbow).toHaveTextContent("two parents with at least 4 different elements between them");
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
    expect(await screen.findAllByText("Reaper", { selector: ".gnode text" }, { timeout: 15_000 })).toHaveLength(1);
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

  it("starts on the original 23-dragon list and can switch to every event dragon", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(scopeButton("favorites")).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelectorAll(".card")).toHaveLength(23);

    await user.click(scopeButton("all"));
    expect(document.querySelectorAll(".card")).toHaveLength(106);
    expect(document.querySelectorAll("#tbl tbody tr")).toHaveLength(106);
    expect(stat(0)).toBe("0 / 106obtained");
    expect(stat(1)).toBe("848,209to buy the rest");
    expect(stat(3)).toBe("Bonecheapest (760)");
    expect(localStorage.getItem(LIST_SCOPE_STORAGE_KEY)).toBe("all");
  });

  it("☆ adds a dragon to my list, ★ removes it, and the list is saved", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(scopeButton("all"));
    await user.click(card("Tickles").querySelector<HTMLButtonElement>("button.fav.big")!);
    expect(card("Tickles").querySelector("button.fav.big")).toHaveAttribute("aria-pressed", "true");
    expect(scopeButton("favorites")).toHaveTextContent("24");

    await user.click(scopeButton("favorites"));
    expect(document.querySelectorAll(".card")).toHaveLength(24);
    expect(visibleCards().at(-1)).toBe("Tickles"); // added to the end of "Your list order"
    expect(stat(0)).toBe("0 / 24obtained");
    expect(stat(2)).toBe("Exterreanmost expensive (18,500)");
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toContain("Tickles");

    await user.click(card("Reaper").querySelector<HTMLButtonElement>("button.fav.big")!);
    expect(card("Reaper")).toBeNull();
    expect(document.querySelectorAll(".card")).toHaveLength(23);
  });

  it("stats, price table and shared ingredients follow a saved custom list", () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Gatren","Fortified","Bogus"]');
    localStorage.setItem(OBTAINED_STORAGE_KEY, '["Fortified"]');
    render(<App />);
    expect(visibleCards()).toEqual(["Gatren", "Fortified"]); // unknown names are dropped
    expect(stat(0)).toBe("1 / 2obtained");
    expect(stat(1)).toBe("4,800to buy the rest (of 22,300)");
    expect([...document.querySelectorAll("#tbl tbody tr")].map((r) => r.getAttribute("data-name"))).toEqual(["Fortified", "Gatren"]);
    expect([...document.querySelectorAll("#shared .node")].map((n) => n.getAttribute("data-name"))).toEqual(["Eldritch", "Oni"]);
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
    expect(confirmSpy).toHaveBeenCalled();
    expect(document.querySelectorAll(".card")).toHaveLength(23);
    confirmSpy.mockRestore();
  });

  it("the graph only shows the active list's trees", async () => {
    const user = userEvent.setup();
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["Gatren"]');
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /Breeding graph/ }));
    await screen.findAllByText("Gatren", { selector: ".gnode text" }, { timeout: 15_000 });
    expect([...document.querySelectorAll(".gnode")].map((g) => g.getAttribute("data-n")).sort()).toEqual(["Eldritch", "Gatren", "Oni"]);
    expect(document.querySelector('.gnode[data-n="Gatren"]')).toHaveClass("target");
    expect(document.querySelector('.gnode[data-n="Oni"]')).not.toHaveClass("target");

    await user.click(scopeButton("all"));
    await waitFor(() => expect(document.querySelectorAll(".gnode")).toHaveLength(145), { timeout: 15_000 });
    expect(document.querySelector('.gnode[data-n="Oni"]')).toHaveClass("target");
  }, 30_000);
});
