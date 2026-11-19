import type { SVGProps } from "react";

/** Small line icons (24×24 grid, drawn with currentColor) used instead of emoji. */
const PATHS = {
  check: "M5 12.5l4.2 4.2L19 7",
  star: "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  chevron: "M9.5 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  fit: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  flake:
    "M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M12 2l-2.5 2.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5" +
    "M3.3 7l.9 3.4M3.3 7l3.4-.9M20.7 17l-.9-3.4M20.7 17l-3.4.9M3.3 17l3.4.9M3.3 17l.9-3.4M20.7 7l-3.4-.9M20.7 7l-.9 3.4",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16, filled = false, ...rest }: { name: IconName; size?: number; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="icon" {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
