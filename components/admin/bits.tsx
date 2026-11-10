import Link from "next/link";
import { TierStars } from "@/components/site/TierStars";
import { daysUntil, inDays, shortDate } from "@/lib/admin/format";
import { statusLabels, type Member, type MemberStatus, type MembershipInfo } from "@/lib/admin/members";
import { formatUkPhone } from "@/lib/site/joinDetails";

/*
 * Small admin pieces. Colour budget is the site's (CLAUDE.md invariant 5): status uses
 * the steel ramp, and ember is reserved for "payment failed" so it is the one thing on
 * a page of members the eye lands on first. Tier metallics stay inside TierStars.
 */

export function StatusBadge({ status, endsAt }: { status: MemberStatus; endsAt?: Date | null }) {
  const label = statusLabels[status];
  const base = "inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em]";
  if (status === "payment_failed") {
    return (
      <span className={`${base} border border-ember text-ember`}>
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ember" />
        {label}
      </span>
    );
  }
  if (status === "cancelling") {
    return (
      <span className={`${base} border border-steel-300 text-steel-200`}>
        {endsAt ? `Ends ${shortDate(endsAt)}` : label}
      </span>
    );
  }
  if (status === "cancelled") return <span className={`${base} px-0 text-steel-400`}>{label}</span>;
  return <span className={`${base} bg-steel-700 text-paper`}>{label}</span>;
}

export function Flag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex whitespace-nowrap border border-paper/30 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-steel-200">
      {children}
    </span>
  );
}

export function MembershipLabel({
  membership,
  compact = false,
  idSuffix,
}: {
  membership: MembershipInfo;
  compact?: boolean;
  /** Unique per rendered instance; see TierStars. */
  idSuffix: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-paper">{membership.label}</span>
      {membership.key && membership.stars ? (
        <TierStars
          tier={membership.key}
          count={membership.stars}
          inline
          idSuffix={idSuffix}
          className="!gap-0.5 [&_svg:not(:first-child)]:!h-3 [&_svg:not(:first-child)]:!w-3"
        />
      ) : null}
      {!compact ? <span className="text-steel-400">£{membership.pricePerMonth}/mo</span> : null}
      {membership.notOnWebsite ? <Flag>Not on website</Flag> : null}
    </span>
  );
}

export function Phone({ phone }: { phone: string | null }) {
  if (!phone) return <span className="text-steel-500">No phone</span>;
  return (
    <a href={`tel:${phone}`} className="hover:text-ember">
      {formatUkPhone(phone)}
    </a>
  );
}

export function Email({ email }: { email: string | null }) {
  if (!email) return <span className="text-steel-500">No email</span>;
  return (
    <a href={`mailto:${email}`} className="break-all hover:text-ember">
      {email}
    </a>
  );
}

export function MemberName({ member }: { member: Member }) {
  return (
    <span className="block">
      <Link href={`/admin/members/${member.customerId}`} className="font-semibold text-paper underline-offset-4 hover:text-ember hover:underline">
        {member.name}
      </Link>
      {member.youthMemberName ? (
        <span className="mt-0.5 block text-xs text-steel-300">Member: {member.youthMemberName}</span>
      ) : null}
    </span>
  );
}

export function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-steel-400 ${className}`}>{children}</p>;
}

/** How long until this member next pays (or leaves), with the date underneath. */
export function NextPayment({ member }: { member: Member }) {
  if (member.status === "payment_failed") return <span className="text-ember">Overdue</span>;
  const date = member.status === "active" ? member.renewsAt : member.status === "cancelling" ? member.endsAt : null;
  if (!date) return <span className="text-steel-500">-</span>;
  const days = daysUntil(date);
  const label = member.status === "cancelling" ? `Leaves ${inDays(days).toLowerCase()}` : inDays(days);
  return (
    <span className="whitespace-nowrap">
      <span className={days <= 3 && member.status === "active" ? "text-paper" : "text-steel-200"}>{label}</span>
      <span className="block text-xs text-steel-400">
        {member.status === "cancelling" ? "Ends" : "Pays"} {shortDate(date)}
      </span>
    </span>
  );
}
