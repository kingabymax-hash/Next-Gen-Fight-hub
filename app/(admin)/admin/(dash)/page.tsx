import { requireOwner } from "@/lib/admin/session";
import Link from "next/link";
import { StatTile } from "@/components/admin/StatTile";
import { Kicker, Phone } from "@/components/admin/bits";
import { getDayLog, getNotSeenLately, NOT_SEEN_DAYS } from "@/lib/admin/checkins";
import { getOverview } from "@/lib/admin/members";
import { daysAgo, money, monthName } from "@/lib/admin/format";

export default async function OverviewPage() {
  await requireOwner();
  const [o, today, notSeen] = await Promise.all([getOverview(), getDayLog(), getNotSeenLately()]);
  const month = monthName();
  const max = Math.max(1, ...o.byMembership.map((m) => m.count));

  return (
    <>
      <p className="kicker mb-3">Overview</p>
      <h1 className="text-5xl leading-[0.95] sm:text-6xl">The gym today</h1>

      <section className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatTile label="Members" value={String(o.activeMembers)} note="Paying or due to pay" href="/admin/members" />
        <StatTile label="Monthly revenue" value={money(o.monthlyRevenue)} note="From paying members" />
        <StatTile label={`New in ${month}`} value={String(o.newThisMonth)} href="/admin/members?sort=newest" />
        <StatTile label={`Left in ${month}`} value={String(o.cancelledThisMonth)} href="/admin/members?status=cancelled" />
        <StatTile
          label="Payment failed"
          value={String(o.needsAttention)}
          note={o.needsAttention ? "Chase these first" : "Nothing to chase"}
          href="/admin/members?status=payment_failed"
          attention={o.needsAttention > 0}
        />
      </section>

      {today.configured ? (
        <section className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-5">
          <StatTile label="Checked in today" value={String(today.checkedIn)} note="Open the front desk" href="/admin/front-desk" />
          <StatTile
            label="Not trained lately"
            value={notSeen ? String(notSeen.length) : "-"}
            note={`No visit in ${NOT_SEEN_DAYS}+ days`}
            href="#not-seen"
          />
        </section>
      ) : null}

      <section className="mt-14 max-w-3xl">
        <Kicker className="mb-5">Members by membership</Kicker>
        {o.byMembership.length === 0 ? (
          <p className="text-sm text-steel-300">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {o.byMembership.map((m) => (
              <li key={m.key ?? m.label}>
                <Link
                  href={`/admin/members?membership=${m.key ?? "other"}`}
                  className="group grid grid-cols-[7.5rem_1fr] items-center gap-4 sm:grid-cols-[10rem_1fr]"
                >
                  <span className="truncate text-sm text-steel-200 group-hover:text-paper">{m.label}</span>
                  <span className="flex items-center gap-3">
                    <span
                      className={`h-5 ${m.featured ? "bg-ember" : "bg-steel-300 group-hover:bg-steel-200"}`}
                      style={{ width: `calc(${(m.count / max) * 100}% - 3rem)`, minWidth: "0.25rem" }}
                      aria-hidden="true"
                    />
                    <span className="font-display text-xl leading-none text-paper">{m.count}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {notSeen && notSeen.length > 0 ? (
        <section id="not-seen" className="mt-14 max-w-3xl scroll-mt-24">
          <Kicker className="mb-2">Not trained in {NOT_SEEN_DAYS}+ days</Kicker>
          <p className="mb-5 text-sm text-steel-300">Still paying, but not coming in. A quick message now keeps them from cancelling.</p>
          <ul className="divide-y divide-paper/10 border-y border-paper/10">
            {notSeen.map(({ member, lastSeen }) => (
              <li key={member.customerId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span>
                  <Link href={`/admin/members/${member.customerId}`} className="font-semibold text-paper underline-offset-4 hover:text-ember hover:underline">
                    {member.youthMemberName || member.name}
                  </Link>
                  <span className="mt-0.5 block text-xs text-steel-400">Last in {daysAgo(lastSeen).toLowerCase()} · {member.membership.label}</span>
                </span>
                <span className="text-steel-200">
                  <Phone phone={member.phone} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
