/** Formats an event-currency amount with thousands separators, e.g. 15000 → "15,000". */
export const formatAmount = (n: number): string => n.toLocaleString("en-US");
