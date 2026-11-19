import { adultSpriteUrl, dragonSpriteUrl, rarityFrameClass } from "../../lib/assets";
import { breedingTimeTooltip } from "../../lib/breedingTime";
import { useAdultSprites } from "../../state/spriteStage";
import { FallbackImage } from "./FallbackImage";

/**
 * Dragon sprite, framed blue (rare) or violet (epic); hovering shows its breeding cave times.
 * Shows the adult dragon when the Trees & prices "adults" switch is on (falling back to the baby
 * sprite if there's no adult art or it fails to load).
 */
export const DragonSprite = ({ name, alt }: { name: string; alt?: string }) => {
  const frame = rarityFrameClass(name);
  const baby = dragonSpriteUrl(name);
  const adult = useAdultSprites() ? adultSpriteUrl(name) : null;
  const src = adult ?? baby;
  return (
    <FallbackImage
      key={src}
      src={src}
      fallbacks={adult ? [baby] : []}
      alt={alt ?? name}
      className={[frame, adult && "adult"].filter(Boolean).join(" ") || undefined}
      title={breedingTimeTooltip(name) || undefined}
    />
  );
};
