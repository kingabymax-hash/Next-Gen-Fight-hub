import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminEnv } from "@/lib/admin/env";

/**
 * The "remember this phone" cookie for /checkin. After a member finds themselves once
 * by phone number or email, their phone holds a signed list of the memberships it
 * can check in (one for most people, several for a parent with juniors). Next time
 * the QR code is scanned they get their tick with no typing.
 *
 * Signed with ADMIN_SESSION_SECRET under its own label, so it can never pass as an
 * admin session and a hand-edited cookie is ignored. It holds subscription ids and
 * first names, nothing else. Membership status is always re-read from Stripe.
 */

export const PASS_COOKIE = "ngfh_checkin";
const PASS_DAYS = 400;
const LABEL = "checkin-pass:v1:";

const passSchema = z
  .array(z.object({ s: z.string().regex(/^sub_[A-Za-z0-9]+$/), c: z.string().regex(/^cus_[A-Za-z0-9]+$/), n: z.string().max(80) }))
  .min(1)
  .max(6);

export type PassEntry = { subscriptionId: string; customerId: string; name: string };

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(LABEL + payload).digest("base64url");
}

export async function readPass(): Promise<PassEntry[] | null> {
  const env = getAdminEnv();
  if (!env) return null;
  const raw = (await cookies()).get(PASS_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload, env.ADMIN_SESSION_SECRET));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const parsed = passSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    if (!parsed.success) return null;
    return parsed.data.map((e) => ({ subscriptionId: e.s, customerId: e.c, name: e.n }));
  } catch {
    return null;
  }
}

/** Only callable from a server action. */
export async function writePass(entries: PassEntry[]): Promise<void> {
  const env = getAdminEnv();
  if (!env || entries.length === 0) return;
  const payload = Buffer.from(
    JSON.stringify(entries.slice(0, 6).map((e) => ({ s: e.subscriptionId, c: e.customerId, n: e.name.slice(0, 80) }))),
  ).toString("base64url");
  (await cookies()).set(PASS_COOKIE, `${payload}.${sign(payload, env.ADMIN_SESSION_SECRET)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/checkin",
    maxAge: PASS_DAYS * 24 * 60 * 60,
  });
}

export async function forgetPass(): Promise<void> {
  (await cookies()).delete({ name: PASS_COOKIE, path: "/checkin" });
}
