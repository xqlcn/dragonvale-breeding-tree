import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { OBTAINED_STORAGE_KEY } from "../src/config";

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
