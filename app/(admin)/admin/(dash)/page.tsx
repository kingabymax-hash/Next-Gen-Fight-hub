import Link from "next/link";
import { StatTile } from "@/components/admin/StatTile";
import { Kicker } from "@/components/admin/bits";
import { getOverview } from "@/lib/admin/members";
import { money, monthName } from "@/lib/admin/format";

export default async function OverviewPage() {
  const o = await getOverview();
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
    </>
  );
}
