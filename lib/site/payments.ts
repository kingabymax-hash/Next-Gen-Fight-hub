/**
 * Stripe hosted Payment Link URLs (public, not secrets). The app has no Stripe SDK
 * and no webhook: every membership/pass button is a plain link to Stripe checkout.
 *
 * Live links come from Hayden's Next Gen Fight Hub Stripe account (GB, GBP, charges
 * and payouts enabled). Anything still "#" renders a graceful "coming soon" state
 * via `isConfigured` rather than a dead link.
 */

export type PaymentKey =
  | "bronze"
  | "silver"
  | "muaythai"
  | "boxing"
  | "gold"
  | "platinum"
  | "juniors"
  | "cadets"
  | "dropIn"
  | "dayPass"
  | "portal";

const PLACEHOLDER = "#";

export const paymentLinks: Record<PaymentKey, string> = {
  // Adult Membership tiers, monthly, matching lib/site/memberships.ts.
  bronze: "https://buy.stripe.com/eVq3cu69KenZg5P3Jkd7q07", // £35/mo
  silver: "https://buy.stripe.com/4gM9AS1TubbNcTD3Jkd7q08", // £50/mo
  gold: "https://buy.stripe.com/dRmaEWaq00x96vfenYd7q09", // £90/mo
  platinum: "https://buy.stripe.com/4gMaEWgOobbNcTD1Bcd7q0a", // £100/mo

  // Discipline memberships, both monthly, both £85.
  muaythai: "https://buy.stripe.com/fZueVc7dOfs34n71Bcd7q0c", // £85/mo, "Muay Thai Monthly"
  boxing: "https://buy.stripe.com/aFa9ASfKk1BdbPza7Id7q0d", // £85/mo, "Boxing Monthly"

  // Youth Muay Thai, both monthly.
  juniors: "https://buy.stripe.com/6oUaEWeGg1Bdg5P7ZAd7q00", // £60/mo
  cadets: "https://buy.stripe.com/7sY28qaq01BdaLv7ZAd7q01", // £65/mo

  // Casual £10 passes are sold at the gym, never online (see MembershipCard).
  dropIn: PLACEHOLDER,
  dayPass: PLACEHOLDER,

  // Stripe customer portal login link: members update their card, download invoices
  // or cancel. Created in the dashboard (Settings > Billing > Customer portal), not
  // via the API. Members sign in with the email they paid with.
  portal: "https://billing.stripe.com/p/login/6oUaEWeGg1Bdg5P7ZAd7q00",
};

export function paymentUrl(key: PaymentKey): string {
  return paymentLinks[key];
}

export function isConfigured(key: PaymentKey): boolean {
  const url = paymentLinks[key];
  return typeof url === "string" && url !== PLACEHOLDER && url.startsWith("http");
}
