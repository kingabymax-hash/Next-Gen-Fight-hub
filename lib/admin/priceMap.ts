import type { PaymentKey } from "@/lib/site/payments";

/**
 * Stripe price id -> the membership it sells, so the dashboard can name members'
 * memberships exactly as the website does (lib/site/memberships.ts).
 *
 * Read from each live Payment Link's line item on 2026-11-09, plus the older prices
 * those links replaced, so members still on an old price are named correctly. A price
 * missing here still shows, labelled with its Stripe product name and "Not on website".
 */
export const priceToPaymentKey: Record<string, PaymentKey> = {
  // Live Payment Link prices
  price_1TGL5KBXlw2O5vBrC29AfGZe: "bronze", // £35
  price_1TGL5LBXlw2O5vBrJpLhcm7i: "silver", // £50
  price_1TGL5NBXlw2O5vBrVu5gZ6Ll: "gold", // £90
  price_1TGL5OBXlw2O5vBr0sGYoBmc: "platinum", // £100
  price_1U5SmgBXlw2O5vBri6NqXNVd: "muaythai", // £85
  price_1U5SmhBXlw2O5vBrH0yxc4DC: "boxing", // £85
  price_1TGL2QBXlw2O5vBrlSTweBMB: "juniors", // £60
  price_1TGL2RBXlw2O5vBrqYvoD0Ma: "cadets", // £65

  // Earlier prices for the same memberships (single "Adult Membership" product, and
  // the Muay Thai £80 / Boxing £75 prices before the £85 change).
  price_1TGL2TBXlw2O5vBreg4YwsnG: "bronze", // £35
  price_1TGL2UBXlw2O5vBr4ZIGQR66: "silver", // £50
  price_1TGL2VBXlw2O5vBr3wr3BQ5P: "gold", // £90
  price_1TGL2WBXlw2O5vBraotgIVZS: "platinum", // £100
  price_1U5SjDBXlw2O5vBrR62HZao3: "muaythai", // £80
  price_1TGL2SBXlw2O5vBrIJ0N5jr5: "boxing", // £75
};
