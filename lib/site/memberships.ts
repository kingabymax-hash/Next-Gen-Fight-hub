/**
 * The paid offerings. Several shapes sit deliberately side by side:
 *   - general tiers (Bronze/Silver/Gold/Platinum),
 *   - discipline-specific memberships (Muay Thai £85, Boxing £85), and
 *   - youth memberships (Juniors £60, Cadets £65), which are Muay Thai only.
 * Plus casual £10 drop-in / day pass. No joining fee. Prices confirmed by Hayden
 * and matched to the live products in his Stripe account.
 *
 * `paymentKey` maps to lib/site/payments.ts. `featured` marks the recommended tier.
 *
 * `stars` is the rank badge shown under a general tier: Bronze 1, Silver 2, Gold 3 and
 * Platinum a full 5, so the jump to the top tier reads as a jump rather than one more
 * notch. Discipline and casual options carry none: they are a different shape of thing,
 * not a rung on the same ladder.
 */
import type { PaymentKey } from "@/lib/site/payments";

export type Cadence = "month" | "one-off";
export type MembershipGroup = "tier" | "discipline" | "youth" | "casual";

export type Membership = {
  key: PaymentKey;
  name: string;
  price: number; // GBP
  cadence: Cadence;
  group: MembershipGroup;
  summary: string;
  includes: string[];
  stars?: number; // rank badge, general tiers only
  featured?: boolean;
};

export const memberships: Membership[] = [
  {
    key: "bronze",
    name: "Bronze",
    price: 35,
    cadence: "month",
    group: "tier",
    summary: "Use of the facilities and open gym.",
    includes: ["Full use of the facilities", "Open gym access"],
    stars: 1,
  },
  {
    key: "silver",
    name: "Silver",
    price: 50,
    cadence: "month",
    group: "tier",
    summary: "Facilities plus one class a week.",
    includes: ["Full use of the facilities", "1 class per week", "Open gym access"],
    stars: 2,
  },
  {
    key: "muaythai",
    name: "Muay Thai",
    price: 85,
    cadence: "month",
    group: "discipline",
    summary: "Muay Thai only: 4 classes a week plus open gym.",
    includes: ["4 Muay Thai classes per week", "Open gym access"],
  },
  {
    key: "juniors",
    name: "Juniors",
    price: 60,
    cadence: "month",
    group: "youth",
    summary: "Muay Thai for our youngest group, three evenings a week.",
    includes: [
      "3 Juniors Muay Thai classes per week",
      "Monday, Tuesday and Thursday, 5pm to 6pm",
      "Always supervised",
    ],
  },
  {
    key: "cadets",
    name: "Cadets",
    price: 65,
    cadence: "month",
    group: "youth",
    summary: "Muay Thai for older juniors and teens, three evenings a week.",
    includes: [
      "3 Cadets Muay Thai classes per week",
      "Monday, Tuesday and Thursday, 6pm to 7pm",
      "Technique, pads and controlled drilling",
    ],
  },
  {
    key: "boxing",
    name: "Boxing",
    price: 85,
    cadence: "month",
    group: "discipline",
    summary: "Boxing only, in partnership with Top Rope Boxing: 4 sessions a week.",
    includes: [
      "4 boxing sessions per week",
      "Mon 8pm, Wed 7:30pm, Fri 7:30pm, Sat 12pm",
      "Run by Top Rope Boxing",
    ],
  },
  {
    key: "gold",
    name: "Gold",
    price: 90,
    cadence: "month",
    group: "tier",
    summary: "Facilities plus five classes a week.",
    includes: ["Full use of the facilities", "5 classes per week", "Open gym access"],
    stars: 3,
  },
  {
    key: "platinum",
    name: "Platinum",
    price: 100,
    cadence: "month",
    group: "tier",
    summary: "Everything, unlimited. All disciplines, including boxing and MMA.",
    includes: [
      "Full use of the facilities",
      "Unlimited classes, every discipline",
      "Boxing and MMA included",
      "Open gym access",
    ],
    stars: 5,
    featured: true,
  },
  {
    key: "dropIn",
    name: "Drop-in class",
    price: 10,
    cadence: "one-off",
    group: "casual",
    summary: "A single class, any discipline.",
    includes: ["One class, any discipline", "No commitment"],
  },
  {
    key: "dayPass",
    name: "Day pass",
    price: 10,
    cadence: "one-off",
    group: "casual",
    summary: "Open gym access for the day, weekends 10am to 4pm.",
    includes: [
      "Open gym access only",
      "Saturday and Sunday, 10am to 4pm",
      "No commitment",
    ],
  },
];

export const membershipsByGroup = {
  tier: memberships.filter((m) => m.group === "tier"),
  discipline: memberships.filter((m) => m.group === "discipline"),
  youth: memberships.filter((m) => m.group === "youth"),
  casual: memberships.filter((m) => m.group === "casual"),
};

export function priceLabel(m: Membership): string {
  return m.cadence === "month" ? `£${m.price}/mo` : `£${m.price}`;
}
