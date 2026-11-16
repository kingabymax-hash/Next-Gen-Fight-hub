import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEnv } from "@/lib/admin/env";

/**
 * Stateless admin session: shared passwords, one signed cookie, no database.
 *
 * Two roles, decided by which password was typed:
 *   owner  ADMIN_PASSWORD  Hayden and Elise: everything.
 *   desk   DESK_PASSWORD   the junior receptionists: the front desk and nothing else
 *                          (no revenue, payments, contact details or member pages).
 *
 * Cookie value is "<role>.<expiry ms>.<HMAC-SHA256(role.expiry, ADMIN_SESSION_SECRET)>".
 * Rotating ADMIN_SESSION_SECRET signs everyone out.
 */

export type Role = "owner" | "desk";
const ROLES: Role[] = ["owner", "desk"];

export const SESSION_COOKIE = "ngfh_admin";
const SESSION_HOURS = 12;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * Which role a password opens, or null. Constant-time comparison on equal-length
 * digests, and both passwords are always checked so timing says nothing.
 */
export function roleForPassword(attempt: string): Role | null {
  const env = getAdminEnv();
  if (!env) return null;
  const given = digest(attempt);
  const owner = timingSafeEqual(given, digest(env.ADMIN_PASSWORD));
  const desk = env.DESK_PASSWORD ? timingSafeEqual(given, digest(env.DESK_PASSWORD)) : false;
  return owner ? "owner" : desk ? "desk" : null;
}

/** Where each role lands after signing in. */
export const homeFor = (role: Role) => (role === "owner" ? "/admin" : "/admin/front-desk");

export async function startSession(role: Role): Promise<void> {
  const env = getAdminEnv();
  if (!env) return;
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = `${role}.${expires}`;
  const value = `${payload}.${sign(payload, env.ADMIN_SESSION_SECRET)}`;
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

/** The signed-in role, or null. */
export async function sessionRole(): Promise<Role | null> {
  const env = getAdminEnv();
  if (!env) return null;
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [role, expires, signature] = raw.split(".");
  if (!role || !expires || !signature || !/^\d+$/.test(expires)) return null;
  if (!ROLES.includes(role as Role)) return null;
  if (Number(expires) < Date.now()) return null;
  // A desk session dies the moment DESK_PASSWORD is removed.
  if (role === "desk" && !env.DESK_PASSWORD) return null;
  const expected = Buffer.from(sign(`${role}.${expires}`, env.ADMIN_SESSION_SECRET));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given) ? (role as Role) : null;
}

/** Any signed-in role. Only for the front desk and what it reads. */
export async function requireSession(): Promise<Role> {
  const role = await sessionRole();
  if (!role) redirect("/admin/login");
  return role;
}

/**
 * Hayden and Elise only. Call at the top of every admin page, loader and route
 * handler except the front desk; a receptionist is sent back to the front desk.
 */
export async function requireOwner(): Promise<void> {
  const role = await requireSession();
  if (role !== "owner") redirect(homeFor(role));
}
