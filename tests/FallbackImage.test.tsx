import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DragonSprite } from "../src/components/common/DragonSprite";
import { EGG_PLACEHOLDER_URL } from "../src/lib/assets";
import { SpriteStageContext } from "../src/state/spriteStage";
import { ADULT_SPRITE_PATHS } from "../src/data/adultSprites";
import { DRAGONS } from "../src/data/dragons";

describe("sprite fallback", () => {
  it("uses the CDN sprite (with custom sprite names) and swaps to the egg on error", () => {
    render(<DragonSprite name="Pyros & Glacius" />);
    const img = screen.getByAltText("Pyros & Glacius");
    expect(img).toHaveAttribute("src", "https://dvboxcdn.com/dragons/Pyros_Glacius.webp");
    expect(img).toHaveAttribute("loading", "lazy");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", EGG_PLACEHOLDER_URL);
  });

  it("replaces spaces in names", () => {
    render(<DragonSprite name="Snowflake 7" />);
    expect(screen.getByAltText("Snowflake 7")).toHaveAttribute("src", "https://dvboxcdn.com/dragons/Snowflake_7.webp");
  });

  it("frames rare and epic sprites, but not hybrids", () => {
    render(<><DragonSprite name="Fubuki" /><DragonSprite name="Thaw" /><DragonSprite name="Tree" /></>);
    expect(screen.getByAltText("Fubuki")).toHaveClass("r-rare");
    expect(screen.getByAltText("Thaw")).toHaveClass("r-epic");
    expect(screen.getByAltText("Tree")).not.toHaveAttribute("class");
    expect(screen.getByAltText("Thaw")).toHaveAttribute("title", expect.stringContaining("Upgraded breeding cave"));
  });
});

describe("adult sprites", () => {
  it("falls back from the adult art to the baby sprite, then the egg", () => {
    render(<SpriteStageContext.Provider value={true}><DragonSprite name="Jawny" /></SpriteStageContext.Provider>);
    const img = screen.getByAltText("Jawny");
    expect(img.getAttribute("src")).toMatch(/JawnyDragonAdult\.png/);
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", "https://dvboxcdn.com/dragons/Jawny.webp");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", EGG_PLACEHOLDER_URL);
  });

  it("every adult sprite belongs to a catalog dragon", () => {
    for (const n of Object.keys(ADULT_SPRITE_PATHS)) expect(DRAGONS[n], n).toBeDefined();
  });
});
