import { useState, type ImgHTMLAttributes } from "react";
import { EGG_PLACEHOLDER_URL } from "../../lib/assets";

/** <img> that swaps to the egg placeholder (once) if the remote image fails to load. */
export function FallbackImage({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [failed, setFailed] = useState(false);
  return <img loading="lazy" {...rest} src={failed ? EGG_PLACEHOLDER_URL : src} onError={() => setFailed(true)} />;
}
