import { createContext, useContext } from "react";
import { ADULT_SPRITES_STORAGE_KEY } from "../config";

/**
 * Whether sprites show the adult dragon instead of the baby. Only the Trees & prices tab provides it
 * (the breeding graph draws its own sprites), so anything outside the provider shows babies.
 */
export const SpriteStageContext = createContext(false);
export const useAdultSprites = (): boolean => useContext(SpriteStageContext);

export function loadAdultSprites(): boolean {
  try {
    return localStorage.getItem(ADULT_SPRITES_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveAdultSprites(adult: boolean): void {
  try {
    localStorage.setItem(ADULT_SPRITES_STORAGE_KEY, adult ? "1" : "0");
  } catch {
    /* storage unavailable: the choice just isn't remembered */
  }
}
