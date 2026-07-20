/**
 * Stripe hosted Payment Link URLs (public, not secrets). The app has no Stripe SDK
 * and no webhook: every membership/pass button is a plain link to Stripe checkout.
 *
 * These stay as "#" placeholders until Hayden's separate Next Gen Stripe account
 * exists and the products + Payment Links are created. `isConfigured` lets the UI
 * render a graceful "coming soon" state instead of a dead link in the meantime.
 */

export type PaymentKey =
  | "bronze"
  | "silver"
  | "muaythai"
  | "boxing"
  | "gold"
  | "platinum"
  | "dropIn"
  | "dayPass"
  | "portal";

const PLACEHOLDER = "#";

export const paymentLinks: Record<PaymentKey, string> = {
  bronze: PLACEHOLDER,
  silver: PLACEHOLDER,
  muaythai: PLACEHOLDER,
  boxing: PLACEHOLDER,
  gold: PLACEHOLDER,
  platinum: PLACEHOLDER,
  dropIn: PLACEHOLDER,
  dayPass: PLACEHOLDER,
  // Stripe customer portal login link (members manage / cancel here).
  portal: PLACEHOLDER,
};

export function paymentUrl(key: PaymentKey): string {
  return paymentLinks[key];
}

export function isConfigured(key: PaymentKey): boolean {
  const url = paymentLinks[key];
  return typeof url === "string" && url !== PLACEHOLDER && url.startsWith("http");
}
