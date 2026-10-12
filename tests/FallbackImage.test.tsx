import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DragonSprite } from "../src/components/common/DragonSprite";
import { EGG_PLACEHOLDER_URL } from "../src/lib/assets";

describe("sprite fallback", () => {
  it("uses the CDN sprite (with custom sprite names) and swaps to the egg on error", () => {
    render(<DragonSprite name="Dracomancy" />);
    const img = screen.getByAltText("Dracomancy");
    expect(img).toHaveAttribute("src", "https://dvboxcdn.com/dragons/Dracomancy_1.webp");
    expect(img).toHaveAttribute("loading", "lazy");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", EGG_PLACEHOLDER_URL);
  });

  it("replaces spaces in names", () => {
    render(<DragonSprite name="Double Rainbow" />);
    expect(screen.getByAltText("Double Rainbow")).toHaveAttribute("src", "https://dvboxcdn.com/dragons/Double_Rainbow.webp");
  });
});
