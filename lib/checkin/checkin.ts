import "server-only";
import { membershipOf, statusOf, type MemberStatus } from "@/lib/admin/members";
import { stripeGet, subscriptionSchema } from "@/lib/admin/stripe";
import { recordCheckIn, type RecordResult } from "@/lib/checkin/store";
import { timetable } from "@/lib/site/timetable";

/**
 * Checking a member in: read their membership live from Stripe (GET only), decide
 * whether they are let in, and log it. Shared by the QR page and the front desk.
 */

export type CheckInOutcome = {
  name: string;
  membershipLabel: string;
  status: MemberStatus;
  allowed: boolean;
  className: string | null;
  record: RecordResult;
};

/** Paid up, or cancelling but still inside the period they paid for. */
export const isAllowed = (status: MemberStatus) => status === "active" || status === "cancelling";

/** "Jamie Biggs" -> "Jamie B." Enough for the front desk to match a face. */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? name;
  return `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
}

/**
 * The class running at `date` (UK time), from the timetable. Counts from 20 minutes
 * before the start, so arriving early still files under the right class.
 */
export function classAt(date: Date): string | null {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = timetable.find((d) => d.short === get("weekday"));
  if (!day) return null;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const slot = day.slots.find((s) => minutes >= toMin(s.start) - 20 && minutes < toMin(s.end));
  return slot?.name ?? null;
}

async function liveMembership(subscriptionId: string) {
  if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) return null;
  const sub = await stripeGet(
    `/subscriptions/${subscriptionId}`,
    { expand: ["customer", "items.data.price.product"] },
    subscriptionSchema,
  );
  return { status: statusOf(sub), membershipLabel: membershipOf(sub, new Map()).label, customerId: sub.customer.id };
}

export async function checkIn(
  member: { subscriptionId: string; customerId: string; name: string },
  via: "qr" | "desk",
): Promise<CheckInOutcome | null> {
  const live = await liveMembership(member.subscriptionId);
  if (!live || live.customerId !== member.customerId) return null;
  const now = new Date();
  const className = classAt(now);
  const record = await recordCheckIn(
    {
      subscriptionId: member.subscriptionId,
      customerId: member.customerId,
      name: member.name,
      membershipLabel: live.membershipLabel,
      status: live.status,
      className,
      via,
    },
    now.getTime(),
  );
  return {
    name: member.name,
    membershipLabel: live.membershipLabel,
    status: live.status,
    allowed: isAllowed(live.status),
    className,
    record,
  };
}
