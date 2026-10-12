import { DRAGONS } from "../../data/dragons";

/** Tag pills describing special breeding conditions (night, rift, evolution, cloning, notes). */
export function DragonTags({ name }: { name: string }) {
  const d = DRAGONS[name];
  if (!d) return null;
  return (
    <>
      {d.breedAtNight && <span className="tag night">🌙 breed at night</span>}
      {d.riftOnly && <span className="tag rift">🌀 Rift only · limited</span>}
      {d.evolvesFrom && <span className="tag evolve">✨ needs {d.evolveRequirement}</span>}
      {d.cloneChance && <span className="tag clone">🧬 co-op single-clone {d.cloneChance} beats breeding</span>}
      {d.note && <span className="tag">{d.note}</span>}
    </>
  );
}
