import "server-only";
import { requireOwner, requireSession } from "@/lib/admin/session";
import { getMembers, isCurrent, type Member } from "@/lib/admin/members";
import { daysUntil } from "@/lib/admin/format";
import { isStoreConfigured, lastSeenAll, listDay, listMemberVisits, londonDay, type CheckIn } from "@/lib/checkin/store";
import { isAllowed } from "@/lib/checkin/checkin";

/** Admin reads of the check-in log. Every one re-checks the session. */

export type DayLog = {
  day: string;
  configured: boolean;
  /** Null when the store could not be read. */
  entries: CheckIn[] | null;
  checkedIn: number;
  turnedAway: number;
  byClass: { name: string; count: number }[];
};

export async function getDayLog(day = londonDay()): Promise<DayLog> {
  await requireSession();
  const configured = isStoreConfigured();
  const entries = configured ? await listDay(day) : [];
  const ok = (entries ?? []).filter((e) => isAllowed(e.status));
  const classes = new Map<string, number>();
  for (const e of ok) {
    const name = e.className ?? "Outside class times";
    classes.set(name, (classes.get(name) ?? 0) + 1);
  }
  return {
    day,
    configured,
    entries,
    checkedIn: ok.length,
    turnedAway: (entries ?? []).length - ok.length,
    byClass: [...classes].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
}

export async function getMemberVisits(customerId: string): Promise<{ configured: boolean; visits: CheckIn[] | null }> {
  await requireOwner();
  if (!isStoreConfigured()) return { configured: false, visits: [] };
  const visits = await listMemberVisits(customerId);
  return { configured: true, visits: visits?.filter((v) => isAllowed(v.status)) ?? null };
}

export const NOT_SEEN_DAYS = 14;

/**
 * Current members whose last check-in was more than two weeks ago: the people to
 * message before they drift off and cancel. Members who have never checked in are
 * left out, so this list is not everyone for the first fortnight after launch.
 */
export async function getNotSeenLately(): Promise<{ member: Member; lastSeen: Date }[] | null> {
  await requireOwner();
  if (!isStoreConfigured()) return null;
  const [members, lastSeen] = await Promise.all([getMembers(), lastSeenAll()]);
  if (!lastSeen) return null;
  const seen = new Set<string>();
  const out: { member: Member; lastSeen: Date }[] = [];
  for (const m of members) {
    if (!isCurrent(m) || seen.has(m.customerId)) continue;
    seen.add(m.customerId);
    const last = lastSeen.get(m.customerId);
    if (last && -daysUntil(last) > NOT_SEEN_DAYS) out.push({ member: m, lastSeen: last });
  }
  return out.sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime());
}

/** Shift a yyyy-mm-dd by whole days. */
export function shiftDay(day: string, by: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + by);
  return d.toISOString().slice(0, 10);
}
