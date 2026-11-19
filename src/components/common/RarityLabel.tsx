import { DRAGONS } from "../../data/dragons";

/** "Rare" / "Epic" in the rarity colour (nothing for hybrids). */
export function RarityLabel({ name }: { name: string }) {
  const r = DRAGONS[name]?.rarity;
  if (r !== "rare" && r !== "epic") return null;
  return <span className={`rarity ${r}`}>{r === "rare" ? "Rare" : "Epic"}</span>;
}
