import { formatCandy } from "../../lib/format";
import { CandyIcon } from "./CandyIcon";

/** Candy icon followed by a formatted amount (no wrapper element). */
export const CandyAmount = ({ amount }: { amount: number }) => (
  <>
    <CandyIcon />
    {formatCandy(amount)}
  </>
);
