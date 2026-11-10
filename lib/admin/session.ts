import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEnv } from "@/lib/admin/env";

/**
 * Stateless admin session: one shared password, one signed cookie, no database.
 * Cookie value is "<expiry ms>.<HMAC-SHA256(expiry, ADMIN_SESSION_SECRET)>".
 * Rotating ADMIN_SESSION_SECRET signs everyone out.
 */

export const SESSION_COOKIE = "ngfh_admin";
const SESSION_HOURS = 12;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison on equal-length digests. */
export function passwordMatches(attempt: string): boolean {
  const env = getAdminEnv();
  if (!env) return false;
  return timingSafeEqual(digest(attempt), digest(env.ADMIN_PASSWORD));
}

export async function startSession(): Promise<void> {
  const env = getAdminEnv();
  if (!env) return;
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const value = `${expires}.${sign(String(expires), env.ADMIN_SESSION_SECRET)}`;
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    expires: new Date(expires),
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}

export async function hasSession(): Promise<boolean> {
  const env = getAdminEnv();
  if (!env) return false;
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return false;
  const [expires, signature] = raw.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires, env.ADMIN_SESSION_SECRET));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Call at the top of every admin page, loader and route handler. */
export async function requireSession(): Promise<void> {
  if (!(await hasSession())) redirect("/admin/login");
}
