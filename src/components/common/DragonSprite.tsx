import { dragonSpriteUrl } from "../../lib/assets";
import { FallbackImage } from "./FallbackImage";

export const DragonSprite = ({ name, alt }: { name: string; alt?: string }) => (
  <FallbackImage src={dragonSpriteUrl(name)} alt={alt ?? name} />
);
