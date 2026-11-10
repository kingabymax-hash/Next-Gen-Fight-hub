import "server-only";
import { cache } from "react";
import { z } from "zod";
import { requireSession } from "@/lib/admin/session";
import {
  listCompletedCheckoutSessions,
  listCustomerInvoices,
  listPaidInvoices,
  listProducts,
  listSubscriptions,
  type StripeCheckoutSession,
  type StripeSubscription,
} from "@/lib/admin/stripe";
import { priceToPaymentKey } from "@/lib/admin/priceMap";
import { startOfLondonMonth } from "@/lib/admin/format";
import { memberships } from "@/lib/site/memberships";
import type { PaymentKey } from "@/lib/site/payments";
import { unpackJoinDetails, type JoinDetails } from "@/lib/site/joinDetails";

/**
 * Every business rule of the dashboard lives here: how Stripe subscriptions become
 * member rows, what each status means, and what the overview figures count.
 * Stripe is read live on every request (React `cache` dedupes within one render);
 * nothing is stored.
 */

export type MemberStatus = "active" | "cancelling" | "payment_failed" | "cancelled";

export const statusLabels: Record<MemberStatus, string> = {
  active: "Active",
  cancelling: "Cancelling",
  payment_failed: "Payment failed",
  cancelled: "Cancelled",
};

export type MembershipInfo = {
  key: PaymentKey | null;
  label: string;
  stars?: number;
  featured: boolean;
  pricePerMonth: number; // GBP
  notOnWebsite: boolean;
};

export type Member = {
  rowId: string; // subscription id
  customerId: string;
  name: string;
  email: string | null;
  phone: string | null;
  youthMemberName: string | null;
  detailsSource: "website" | "stripe";
  membership: MembershipInfo;
  status: MemberStatus;
  /** When a cancelling membership stops. */
  endsAt: Date | null;
  /** When an active membership next takes a payment (end of the paid-up period). */
  renewsAt: Date | null;
  memberSince: Date;
  lastPaymentAt: Date | null;
  totalPaid: number; // GBP, across all their memberships
  /** More than one live membership: usually a missed cancellation to sort out. */
  duplicate: boolean;
  stripeUrl: string;
};

// ---------------------------------------------------------------------------

const toDate = (seconds: number) => new Date(seconds * 1000);

/** Subscriptions that were never paid for are not members. */
const NEVER_PAID = new Set(["incomplete", "incomplete_expired"]);

export function statusOf(sub: StripeSubscription): MemberStatus {
  switch (sub.status) {
    case "past_due":
    case "unpaid":
    case "paused":
      return "payment_failed";
    case "active":
    case "trialing":
      return sub.cancel_at_period_end || sub.cancel_at ? "cancelling" : "active";
    default:
      return "cancelled";
  }
}

function endsAt(sub: StripeSubscription): Date | null {
  if (sub.cancel_at) return toDate(sub.cancel_at);
  const periodEnd = sub.items.data[0]?.current_period_end;
  return sub.cancel_at_period_end && periodEnd ? toDate(periodEnd) : null;
}

function renewsAt(sub: StripeSubscription): Date | null {
  if (statusOf(sub) !== "active") return null;
  const periodEnd = sub.items.data[0]?.current_period_end;
  return periodEnd ? toDate(periodEnd) : null;
}

export function membershipOf(sub: StripeSubscription, productNames: Map<string, string>): MembershipInfo {
  const item = sub.items.data[0];
  const price = item?.price;
  const quantity = item?.quantity ?? 1;
  let perMonth = ((price?.unit_amount ?? 0) * quantity) / 100;
  const interval = price?.recurring?.interval;
  const count = price?.recurring?.interval_count ?? 1;
  if (interval === "year") perMonth = perMonth / (12 * count);
  else if (interval === "week") perMonth = (perMonth * 52) / (12 * count);
  else if (interval === "day") perMonth = (perMonth * 365) / (12 * count);
  else perMonth = perMonth / count;
  perMonth = Math.round(perMonth * 100) / 100;

  const key = price ? priceToPaymentKey[price.id] : undefined;
  const site = key ? memberships.find((m) => m.key === key) : undefined;
  if (site) {
    return {
      key: site.key,
      label: site.name,
      stars: site.stars,
      featured: !!site.featured,
      pricePerMonth: perMonth,
      notOnWebsite: false,
    };
  }
  const product = price?.product;
  const productName =
    typeof product === "object" ? product.name : product ? productNames.get(product) : null;
  return {
    key: null,
    label: productName || "Unknown membership",
    featured: false,
    pricePerMonth: perMonth,
    notOnWebsite: true,
  };
}

// ---------------------------------------------------------------------------

type Loaded = {
  members: Member[];
  subscriptionsByCustomer: Map<string, StripeSubscription[]>;
  subscriptions: StripeSubscription[];
  productNames: Map<string, string>;
};

const load = cache(async (): Promise<Loaded> => {
  await requireSession();
  const [allSubs, sessions, invoices, products] = await Promise.all([
    listSubscriptions(),
    listCompletedCheckoutSessions(),
    listPaidInvoices(),
    listProducts(),
  ]);
  const productNames = new Map(products.map((p) => [p.id, p.name]));

  const subscriptions = allSubs.filter((s) => !NEVER_PAID.has(s.status));

  const sessionBySub = new Map<string, StripeCheckoutSession>();
  for (const s of sessions) if (s.subscription) sessionBySub.set(s.subscription, s);

  const paidByCustomer = new Map<string, { total: number; last: number | null }>();
  for (const inv of invoices) {
    const entry = paidByCustomer.get(inv.customer) ?? { total: 0, last: null };
    entry.total += inv.amount_paid / 100;
    const paidAt = inv.status_transitions.paid_at ?? inv.created;
    if (inv.amount_paid > 0 && (entry.last === null || paidAt > entry.last)) entry.last = paidAt;
    paidByCustomer.set(inv.customer, entry);
  }

  const subscriptionsByCustomer = new Map<string, StripeSubscription[]>();
  for (const sub of subscriptions) {
    const list = subscriptionsByCustomer.get(sub.customer.id) ?? [];
    list.push(sub);
    subscriptionsByCustomer.set(sub.customer.id, list);
  }

  const members: Member[] = [];
  for (const [customerId, subs] of subscriptionsByCustomer) {
    const first = subs[0];
    if (!first) continue;
    const customer = first.customer;
    const live = subs.filter((s) => statusOf(s) !== "cancelled");
    const latestEnded = [...subs].sort(
      (a, b) => (b.ended_at ?? b.canceled_at ?? b.created) - (a.ended_at ?? a.canceled_at ?? a.created),
    )[0] ?? first;
    const rowSubs = live.length > 0 ? live : [latestEnded];

    // Newest completed checkout for this customer, for details and fallbacks.
    const customerSessions = subs
      .map((s) => sessionBySub.get(s.id))
      .filter((s): s is StripeCheckoutSession => !!s);
    const memberSince = toDate(Math.min(...subs.map((s) => s.start_date)));
    const paid = paidByCustomer.get(customerId);

    for (const sub of rowSubs) {
      const session = sessionBySub.get(sub.id);
      const details: JoinDetails | null =
        unpackJoinDetails(session?.client_reference_id) ??
        customerSessions.map((s) => unpackJoinDetails(s.client_reference_id)).find(Boolean) ??
        null;
      const stripeName = "deleted" in customer && customer.deleted ? null : customer.name;
      const stripeEmail = "deleted" in customer && customer.deleted ? null : customer.email;
      const stripePhone = "deleted" in customer && customer.deleted ? null : customer.phone;
      const email = stripeEmail ?? session?.customer_details?.email ?? null;

      members.push({
        rowId: sub.id,
        customerId,
        name: details?.name || stripeName || session?.customer_details?.name || email || "Unknown",
        email,
        phone: details?.phone || stripePhone || session?.customer_details?.phone || null,
        youthMemberName: details?.memberName ?? null,
        detailsSource: details ? "website" : "stripe",
        membership: membershipOf(sub, productNames),
        status: statusOf(sub),
        endsAt: endsAt(sub),
        renewsAt: renewsAt(sub),
        memberSince,
        lastPaymentAt: paid?.last ? toDate(paid.last) : null,
        totalPaid: Math.round((paid?.total ?? 0) * 100) / 100,
        duplicate: live.length > 1,
        stripeUrl: `https://dashboard.stripe.com/customers/${customerId}`,
      });
    }
  }

  return { members, subscriptionsByCustomer, subscriptions, productNames };
});

export async function getMembers(): Promise<Member[]> {
  return (await load()).members;
}

// ---------------------------------------------------------------------------
// Overview

export type Overview = {
  activeMembers: number;
  monthlyRevenue: number;
  newThisMonth: number;
  cancelledThisMonth: number;
  needsAttention: number;
  byMembership: { key: PaymentKey | null; label: string; featured: boolean; count: number }[];
};

export const isCurrent = (m: Member) => m.status !== "cancelled";

export async function getOverview(now = new Date()): Promise<Overview> {
  const { members, subscriptions } = await load();
  const monthStart = startOfLondonMonth(now).getTime() / 1000;
  const current = members.filter(isCurrent);

  const counts = new Map<string, Overview["byMembership"][number]>();
  for (const m of current) {
    const id = m.membership.key ?? `other:${m.membership.label}`;
    const entry = counts.get(id) ?? { key: m.membership.key, label: m.membership.label, featured: m.membership.featured, count: 0 };
    entry.count += 1;
    counts.set(id, entry);
  }
  const order = (key: PaymentKey | null) => {
    const i = memberships.findIndex((m) => m.key === key);
    return i === -1 ? memberships.length : i;
  };
  const byMembership = [...counts.values()].sort((a, b) => b.count - a.count || order(a.key) - order(b.key));

  return {
    activeMembers: new Set(current.map((m) => m.customerId)).size,
    // Payment-failed members are counted as members but not as revenue.
    monthlyRevenue:
      Math.round(
        current.filter((m) => m.status !== "payment_failed").reduce((sum, m) => sum + m.membership.pricePerMonth, 0) * 100,
      ) / 100,
    newThisMonth: subscriptions.filter((s) => s.created >= monthStart).length,
    cancelledThisMonth: subscriptions.filter((s) => s.ended_at !== null && s.ended_at >= monthStart).length,
    needsAttention: current.filter((m) => m.status === "payment_failed").length,
    byMembership,
  };
}

// ---------------------------------------------------------------------------
// Members list: search, filter, sort (all from URL search params)

export const statusFilters = ["current", "active", "cancelling", "payment_failed", "cancelled", "all"] as const;
export const sortOptions = ["newest", "due", "name", "paid"] as const;

const one = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const membersQuerySchema = z.object({
  q: z.preprocess(one, z.string().trim().max(100).catch("")).default(""),
  status: z.preprocess(one, z.enum(statusFilters).catch("current")).default("current"),
  membership: z.preprocess(one, z.string().max(40).catch("")).default(""),
  sort: z.preprocess(one, z.enum(sortOptions).catch("newest")).default("newest"),
});
export type MembersQuery = z.infer<typeof membersQuerySchema>;

export function parseMembersQuery(params: Record<string, string | string[] | undefined>): MembersQuery {
  return membersQuerySchema.parse(params);
}

export function membersQueryString(q: MembersQuery): string {
  const qs = new URLSearchParams();
  if (q.q) qs.set("q", q.q);
  if (q.status !== "current") qs.set("status", q.status);
  if (q.membership) qs.set("membership", q.membership);
  if (q.sort !== "newest") qs.set("sort", q.sort);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function digits(s: string) {
  return s.replace(/\D/g, "");
}

function matchesSearch(m: Member, q: string): boolean {
  const needle = q.toLowerCase();
  const text = [m.name, m.email ?? "", m.youthMemberName ?? ""].join(" ").toLowerCase();
  if (text.includes(needle)) return true;
  const d = digits(q);
  if (d.length >= 3 && m.phone) {
    const e164 = digits(m.phone); // 447763169961
    const local = e164.startsWith("44") ? `0${e164.slice(2)}` : e164; // 07763169961
    return e164.includes(d) || local.includes(d);
  }
  return false;
}

/** Overdue first, then whoever pays (or leaves) soonest; cancelled last. */
function dueKey(m: Member): number {
  if (m.status === "payment_failed") return -Infinity;
  return (m.renewsAt ?? m.endsAt)?.getTime() ?? Infinity;
}

export function filterMembers(members: Member[], q: MembersQuery): Member[] {
  const rows = members.filter((m) => {
    if (q.status === "current" && !isCurrent(m)) return false;
    if (q.status !== "current" && q.status !== "all" && m.status !== q.status) return false;
    if (q.membership === "other" && m.membership.key !== null) return false;
    if (q.membership && q.membership !== "other" && m.membership.key !== q.membership) return false;
    if (q.q && !matchesSearch(m, q.q)) return false;
    return true;
  });
  const sorters: Record<MembersQuery["sort"], (a: Member, b: Member) => number> = {
    newest: (a, b) => b.memberSince.getTime() - a.memberSince.getTime(),
    name: (a, b) => a.name.localeCompare(b.name, "en-GB", { sensitivity: "base" }),
    paid: (a, b) => b.totalPaid - a.totalPaid,
    due: (a, b) => dueKey(a) - dueKey(b),
  };
  return rows.sort(sorters[q.sort]);
}

// ---------------------------------------------------------------------------
// Member detail

export type MemberDetail = {
  member: Member;
  rows: Member[];
  history: {
    id: string;
    membership: MembershipInfo;
    status: MemberStatus;
    startedAt: Date;
    endedAt: Date | null;
    endsAt: Date | null;
  }[];
  payments: {
    id: string;
    number: string | null;
    date: Date;
    amount: number;
    status: string;
    url: string | null;
    membershipLabel: string | null;
  }[];
};

export async function getMemberDetail(customerId: string): Promise<MemberDetail | null> {
  const { members, subscriptionsByCustomer, productNames } = await load();
  const rows = members.filter((m) => m.customerId === customerId);
  const subs = subscriptionsByCustomer.get(customerId);
  const member = rows[0];
  if (!member || !subs) return null;

  const labelBySub = new Map(subs.map((s) => [s.id, membershipOf(s, productNames).label]));
  const invoices = await listCustomerInvoices(customerId);

  return {
    member,
    rows,
    history: [...subs]
      .sort((a, b) => b.start_date - a.start_date)
      .map((s) => ({
        id: s.id,
        membership: membershipOf(s, productNames),
        status: statusOf(s),
        startedAt: toDate(s.start_date),
        endedAt: s.ended_at ? toDate(s.ended_at) : null,
        endsAt: endsAt(s),
      })),
    payments: invoices
      .filter((inv) => inv.status && inv.status !== "draft")
      .map((inv) => ({
        id: inv.id,
        number: inv.number,
        date: toDate(inv.status_transitions.paid_at ?? inv.created),
        amount: (inv.status === "paid" ? inv.amount_paid : inv.amount_due) / 100,
        status: inv.status as string,
        url: inv.hosted_invoice_url ?? null,
        membershipLabel: labelBySub.get(inv.parent?.subscription_details?.subscription ?? "") ?? null,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
  };
}
