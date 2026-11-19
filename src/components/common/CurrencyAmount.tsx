import { formatAmount } from "../../lib/format";
import { CurrencyIcon } from "./CurrencyIcon";

/** Event-currency icon followed by a formatted amount (no wrapper element). */
export const CurrencyAmount = ({ amount }: { amount: number }) => (
  <>
    <CurrencyIcon />
    {formatAmount(amount)}
  </>
);
