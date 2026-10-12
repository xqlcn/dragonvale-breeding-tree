/** Formats a Candy amount with thousands separators, e.g. 15000 → "15,000". */
export const formatCandy = (n: number): string => n.toLocaleString("en-US");
