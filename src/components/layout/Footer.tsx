import { CURRENCY_NAME, EVENT_NAME } from "../../config";

export const Footer = () => (
  <footer>
    Sprites from dvboxcdn.com. Prices are{" "}
    {CURRENCY_NAME} in the {EVENT_NAME} event market. Recipes are cross-checked against DV Box, and cloning and
    evolution notes come from the same forum thread.
  </footer>
);
