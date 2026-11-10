import "server-only";
import { z } from "zod";
import { requireAdminEnv } from "@/lib/admin/env";

/**
 * The only code that talks to Stripe. Read-only by construction: `stripeGet` is the
 * single exported way to call the API and it can only send GET. No Stripe SDK
 * (CLAUDE.md invariant 2); responses are parsed with zod so a Stripe shape change
 * fails loudly here, not halfway down a page.
 */

const API = "https://api.stripe.com/v1";

type Params = Record<string, string | number | string[] | undefined>;

function query(params: Params): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => qs.append(`${key}[]`, v));
    else qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class StripeReadError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
  ) {
    super(`Stripe read failed (${status}${code ? `, ${code}` : ""})`);
  }
}

export async function stripeGet<T>(path: string, params: Params, schema: z.ZodType<T>): Promise<T> {
  const { STRIPE_SECRET_KEY } = requireAdminEnv();
  const res = await fetch(`${API}${path}${query(params)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    cache: "no-store",
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    // Log the error code only, never the payload: it can hold personal data.
    const code = (json as { error?: { code?: string } } | null)?.error?.code;
    console.error(`[admin] Stripe GET ${path} -> ${res.status} ${code ?? ""}`);
    throw new StripeReadError(res.status, code);
  }
  return schema.parse(json);
}

/** Follows `has_more` / `starting_after` until the whole list is read. */
export async function stripeListAll<T extends { id: string }>(
  path: string,
  params: Params,
  item: z.ZodType<T>,
): Promise<T[]> {
  const page = z.object({ data: z.array(item), has_more: z.boolean() });
  const all: T[] = [];
  let startingAfter: string | undefined;
  for (let i = 0; i < 100; i++) {
    const res = await stripeGet(path, { ...params, limit: 100, starting_after: startingAfter }, page);
    all.push(...res.data);
    if (!res.has_more || res.data.length === 0) return all;
    startingAfter = res.data[res.data.length - 1]?.id;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Schemas: only the fields the dashboard reads.

const productSchema = z.union([
  z.string(),
  z.object({ id: z.string(), name: z.string().nullish() }),
]);

const priceSchema = z.object({
  id: z.string(),
  unit_amount: z.number().nullable(),
  product: productSchema,
  recurring: z.object({ interval: z.string(), interval_count: z.number() }).nullable(),
});

const customerSchema = z.union([
  z.object({
    id: z.string(),
    deleted: z.literal(true),
  }),
  z.object({
    id: z.string(),
    deleted: z.undefined().optional(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    created: z.number(),
  }),
]);

export const subscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  created: z.number(),
  start_date: z.number(),
  cancel_at_period_end: z.boolean(),
  cancel_at: z.number().nullable(),
  canceled_at: z.number().nullable(),
  ended_at: z.number().nullable(),
  customer: customerSchema,
  items: z.object({
    data: z.array(
      z.object({
        quantity: z.number().nullish(),
        current_period_end: z.number().nullish(),
        price: priceSchema,
      }),
    ),
  }),
});
export type StripeSubscription = z.infer<typeof subscriptionSchema>;
export type StripeCustomer = StripeSubscription["customer"];

export const checkoutSessionSchema = z.object({
  id: z.string(),
  subscription: z.string().nullable(),
  client_reference_id: z.string().nullable(),
  customer_details: z
    .object({ name: z.string().nullish(), email: z.string().nullish(), phone: z.string().nullish() })
    .nullable(),
});
export type StripeCheckoutSession = z.infer<typeof checkoutSessionSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  customer: z.string(),
  number: z.string().nullable(),
  status: z.string().nullable(),
  created: z.number(),
  amount_due: z.number(),
  amount_paid: z.number(),
  hosted_invoice_url: z.string().nullish(),
  status_transitions: z.object({ paid_at: z.number().nullable() }),
  parent: z
    .object({
      subscription_details: z.object({ subscription: z.string() }).nullish(),
    })
    .nullish(),
});
export type StripeInvoice = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Reads used by the dashboard.

export function listSubscriptions() {
  return stripeListAll(
    "/subscriptions",
    // Product names come from listProducts(): Stripe caps list expansion depth.
    { status: "all", expand: ["data.customer"] },
    subscriptionSchema,
  );
}

const productListSchema = z.object({ id: z.string(), name: z.string() });

/** Includes archived products, so members on an old price still get a name. */
export function listProducts() {
  return stripeListAll("/products", {}, productListSchema);
}

export function listCompletedCheckoutSessions() {
  return stripeListAll("/checkout/sessions", { status: "complete" }, checkoutSessionSchema);
}

export function listPaidInvoices() {
  return stripeListAll("/invoices", { status: "paid" }, invoiceSchema);
}

export function listCustomerInvoices(customerId: string) {
  return stripeListAll("/invoices", { customer: customerId }, invoiceSchema);
}
