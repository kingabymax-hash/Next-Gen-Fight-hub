import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { MemberStatus } from "@/lib/admin/members";

/**
 * The check-in log: the only data this app stores itself (CLAUDE.md invariant 1).
 * Upstash Redis over its REST API, so no SDK and no connection pool. Vercel's
 * Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN; a plain Upstash
 * database sets UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Either works.
 *
 * Like email, the log is a side-effect, never a dependency: every function here
 * catches its own failures. If the store is missing or down, members still get their
 * tick at the door; the visit just is not recorded.
 *
 * Keys:
 *   ci:day:<yyyy-mm-dd>    list of CheckIn JSON, newest first (UK date)
 *   ci:member:<cus_id>     list of CheckIn JSON, newest first, last 500 kept
 *   ci:last                hash cus_id -> last check-in (ms)
 *   ci:seen:<sub_id>       first check-in of this visit; stops double counting
 *   ci:rl:<ip>             lookups from this IP in the last 10 minutes
 */

export type CheckIn = {
  at: number; // ms
  subscriptionId: string;
  customerId: string;
  name: string;
  membershipLabel: string;
  status: MemberStatus;
  /** The timetable class running at the time, if any. */
  className: string | null;
  via: "qr" | "desk";
};

const checkInSchema = z.object({
  at: z.number(),
  subscriptionId: z.string(),
  customerId: z.string(),
  name: z.string(),
  membershipLabel: z.string(),
  status: z.enum(["active", "cancelling", "payment_failed", "cancelled"]),
  className: z.string().nullable(),
  via: z.enum(["qr", "desk"]),
});

/** A second scan inside this window is the same visit. */
const VISIT_WINDOW_SECONDS = 3 * 60 * 60;
const DAY_TTL_SECONDS = 400 * 24 * 60 * 60;
const MEMBER_HISTORY = 500;

type Config = { url: string; token: string };

function config(): Config | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function isStoreConfigured(): boolean {
  return config() !== null;
}

type Command = (string | number)[];

/** Runs commands in one round trip. Returns null on any failure. */
async function pipeline(commands: Command[]): Promise<unknown[] | null> {
  const c = config();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands.map((cmd) => cmd.map(String))),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[checkin] store -> ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { result?: unknown; error?: string }[];
    if (json.some((r) => r.error)) {
      console.error("[checkin] store command failed:", json.find((r) => r.error)?.error);
      return null;
    }
    return json.map((r) => r.result);
  } catch (err) {
    console.error("[checkin] store unreachable:", err instanceof Error ? err.message : err);
    return null;
  }
}

/** UK calendar date, yyyy-mm-dd. */
export function londonDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(date);
}

function parseList(value: unknown): CheckIn[] {
  if (!Array.isArray(value)) return [];
  const out: CheckIn[] = [];
  for (const raw of value) {
    try {
      const parsed = checkInSchema.safeParse(JSON.parse(String(raw)));
      if (parsed.success) out.push(parsed.data);
    } catch {
      // skip a garbled row rather than lose the day
    }
  }
  return out;
}

export type RecordResult =
  | { kind: "recorded"; at: number }
  | { kind: "already"; at: number }
  | { kind: "not_recorded"; at: number };

/**
 * Logs a check-in, once per visit. A second scan within three hours returns the
 * first time instead of logging twice. Refused check-ins (payment failed, cancelled)
 * are logged too, so the front desk sees them.
 */
export async function recordCheckIn(entry: Omit<CheckIn, "at">, now = Date.now()): Promise<RecordResult> {
  const seenKey = `ci:seen:${entry.subscriptionId}`;
  const allowed = entry.status === "active" || entry.status === "cancelling";

  if (allowed) {
    const claim = await pipeline([
      ["SET", seenKey, now, "NX", "EX", VISIT_WINDOW_SECONDS],
      ["GET", seenKey],
    ]);
    if (!claim) return { kind: "not_recorded", at: now };
    if (claim[0] !== "OK") {
      const first = Number(claim[1]);
      return { kind: "already", at: Number.isFinite(first) ? first : now };
    }
  }

  const row: CheckIn = { ...entry, at: now };
  const json = JSON.stringify(row);
  const dayKey = `ci:day:${londonDay(new Date(now))}`;
  const memberKey = `ci:member:${entry.customerId}`;
  const commands: Command[] = [
    ["LPUSH", dayKey, json],
    ["EXPIRE", dayKey, DAY_TTL_SECONDS],
  ];
  if (allowed) {
    commands.push(
      ["LPUSH", memberKey, json],
      ["LTRIM", memberKey, 0, MEMBER_HISTORY - 1],
      ["HSET", "ci:last", entry.customerId, now],
    );
  }
  const done = await pipeline(commands);
  return done ? { kind: "recorded", at: now } : { kind: "not_recorded", at: now };
}

export async function listDay(day: string): Promise<CheckIn[] | null> {
  const res = await pipeline([["LRANGE", `ci:day:${day}`, 0, -1]]);
  return res ? parseList(res[0]) : null;
}

export async function listMemberVisits(customerId: string, limit = 60): Promise<CheckIn[] | null> {
  const res = await pipeline([["LRANGE", `ci:member:${customerId}`, 0, limit - 1]]);
  return res ? parseList(res[0]) : null;
}

/** Last check-in time per customer. */
export async function lastSeenAll(): Promise<Map<string, Date> | null> {
  const res = await pipeline([["HGETALL", "ci:last"]]);
  if (!res || !Array.isArray(res[0])) return null;
  const flat = res[0] as unknown[];
  const map = new Map<string, Date>();
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const ms = Number(flat[i + 1]);
    if (Number.isFinite(ms)) map.set(String(flat[i]), new Date(ms));
  }
  return map;
}

// ---------------------------------------------------------------------------
// Rate limit for the public lookup, so nobody can try phone numbers in bulk.

const LOOKUP_LIMIT = 8;
const LOOKUP_WINDOW_SECONDS = 10 * 60;

// Fallback when the store is not set up: per server instance only, but better than none.
const memoryLimiter = new Map<string, { count: number; resetAt: number }>();

/** True while this IP may still try a lookup. */
export async function lookupAllowed(ip: string): Promise<boolean> {
  const res = await pipeline([["GET", `ci:rl:${ip}`]]);
  if (res) return Number(res[0] ?? 0) < LOOKUP_LIMIT;
  const entry = memoryLimiter.get(ip);
  return !entry || entry.resetAt < Date.now() || entry.count < LOOKUP_LIMIT;
}

/** Counts every lookup, found or not: a hit reveals a first name, so it is not free. */
export async function countLookup(ip: string): Promise<void> {
  const key = `ci:rl:${ip}`;
  const res = await pipeline([
    ["INCR", key],
    ["EXPIRE", key, LOOKUP_WINDOW_SECONDS, "NX"],
  ]);
  if (res) return;
  const now = Date.now();
  const entry = memoryLimiter.get(ip);
  if (!entry || entry.resetAt < now) memoryLimiter.set(ip, { count: 1, resetAt: now + LOOKUP_WINDOW_SECONDS * 1000 });
  else entry.count += 1;
}

// ---------------------------------------------------------------------------
// Check-in photos: one selfie per person who trains, taken live on their first
// check-in, so the front desk can match the face to the membership. Private: only
// served to signed-in staff by app/(admin)/admin/photo/[key]/route.ts, never shown on
// the member's phone. Set once; only an owner can clear it so it can be retaken,
// which stops a friend replacing the photo with their own face.
//
//   ci:photo:<key>   base64 JPEG (resized in the browser, about 30 to 80 KB)
//   ci:photo-at:<key> when it was taken (ms)

const MAX_PHOTO_BYTES = 300_000;

/**
 * One key per person training: the customer plus the trainee's name, because a
 * parent paying for two juniors is one Stripe customer with two faces.
 */
export function photoKey(customerId: string, name: string): string {
  const hash = createHash("sha256").update(name.trim().toLowerCase()).digest("hex").slice(0, 12);
  return `${customerId}_${hash}`;
}

export const isPhotoKey = (key: string) => /^cus_[A-Za-z0-9]+_[0-9a-f]{12}$/.test(key);

/** Every photo key that has a selfie, so a whole list is checked in one command. */
const PHOTO_INDEX = "ci:photos";

/** Which of these keys have a photo. Null when the store cannot be read. */
export async function photosExist(keys: string[]): Promise<Set<string> | null> {
  const unique = [...new Set(keys)];
  if (unique.length === 0) return new Set();
  // One command however many faces: the front desk asks this on every refresh, and
  // the free Upstash plan counts each command in a pipeline.
  const res = await pipeline([["SMISMEMBER", PHOTO_INDEX, ...unique]]);
  if (!res || !Array.isArray(res[0])) return null;
  const flags = res[0] as unknown[];
  return new Set(unique.filter((_, i) => Number(flags[i]) === 1));
}

export async function getPhoto(key: string): Promise<{ jpeg: Buffer; at: number | null } | null> {
  const res = await pipeline([
    ["GET", `ci:photo:${key}`],
    ["GET", `ci:photo-at:${key}`],
  ]);
  if (!res || typeof res[0] !== "string") return null;
  return { jpeg: Buffer.from(res[0], "base64"), at: res[1] ? Number(res[1]) : null };
}

export type SavePhotoResult = "saved" | "exists" | "invalid" | "failed";

/** Never overwrites: the first photo stands until an owner clears it. */
export async function savePhoto(key: string, jpeg: Buffer, now = Date.now()): Promise<SavePhotoResult> {
  const isJpeg = jpeg.length > 3 && jpeg[0] === 0xff && jpeg[1] === 0xd8 && jpeg[2] === 0xff;
  if (!isJpeg || jpeg.length > MAX_PHOTO_BYTES || jpeg.length < 2_000) return "invalid";
  const res = await pipeline([
    ["SET", `ci:photo:${key}`, jpeg.toString("base64"), "NX"],
    ["SET", `ci:photo-at:${key}`, now, "NX"],
    ["SADD", PHOTO_INDEX, key],
  ]);
  if (!res) return "failed";
  return res[0] === "OK" ? "saved" : "exists";
}

export async function deletePhoto(key: string): Promise<boolean> {
  return (await pipeline([["DEL", `ci:photo:${key}`, `ci:photo-at:${key}`], ["SREM", PHOTO_INDEX, key]])) !== null;
}
