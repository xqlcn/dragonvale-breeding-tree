import { useState, type ImgHTMLAttributes } from "react";
import { EGG_PLACEHOLDER_URL } from "../../lib/assets";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** Tried in order if `src` fails to load, before the egg placeholder. */
  fallbacks?: readonly string[];
};

/**
 * <img> that steps through `fallbacks` and finally the egg placeholder when an image fails to load.
 * Give it a `key` that changes with `src` so a new source starts from the top again.
 */
export function FallbackImage({ src, fallbacks = [], ...rest }: Props) {
  const chain = [src, ...fallbacks, EGG_PLACEHOLDER_URL];
  const [step, setStep] = useState(0);
  const current = chain[Math.min(step, chain.length - 1)]!;
  return <img loading="lazy" {...rest} src={current} onError={() => setStep((s) => Math.min(s + 1, chain.length - 1))} />;
}
