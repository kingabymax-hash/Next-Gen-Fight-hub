import type { Metadata } from "next";
import Link from "next/link";
import { Email, Flag, MemberName, MembershipLabel, NextPayment, Phone, StatusBadge } from "@/components/admin/bits";
import { money, shortDate } from "@/lib/admin/format";
import {
  filterMembers,
  getMembers,
  membersQueryString,
  parseMembersQuery,
  statusLabels,
  type Member,
  type MembersQuery,
} from "@/lib/admin/members";
import { memberships } from "@/lib/site/memberships";

export const metadata: Metadata = { title: "Members" };

const statusOptions: { value: MembersQuery["status"]; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "active", label: statusLabels.active },
  { value: "cancelling", label: statusLabels.cancelling },
  { value: "payment_failed", label: statusLabels.payment_failed },
  { value: "cancelled", label: statusLabels.cancelled },
  { value: "all", label: "Everyone" },
];

const sortLabels: Record<MembersQuery["sort"], string> = {
  newest: "Newest first",
  due: "Next to pay",
  name: "Name A to Z",
  paid: "Most paid",
};

const control =
  "w-full border border-paper/20 bg-ink px-3 py-2.5 text-base text-paper focus:border-ember focus:outline-none sm:text-sm";

function Badges({ m }: { m: Member }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <StatusBadge status={m.status} endsAt={m.endsAt} />
      {m.duplicate ? <Flag>Duplicate</Flag> : null}
    </span>
  );
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseMembersQuery(await searchParams);
  const all = await getMembers();
  const rows = filterMembers(all, query);
  const exportHref = `/admin/members/export${membersQueryString(query)}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-3">Members</p>
          <h1 className="text-5xl leading-[0.95] sm:text-6xl">
            {rows.length} {rows.length === 1 ? "person" : "people"}
          </h1>
        </div>
        <a
          href={exportHref}
          className="rounded-md border border-paper/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          Download CSV
        </a>
      </div>

      {/* Plain GET form: filters live in the URL, so views can be bookmarked and the
          CSV export reads the same params. Works with no JavaScript. */}
      <form method="get" className="mt-8 grid gap-3 border-y border-paper/10 py-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="Search name, email or phone"
            className={control}
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={query.status} className={control}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Membership</span>
          <select name="membership" defaultValue={query.membership} className={control}>
            <option value="">All memberships</option>
            {memberships
              .filter((m) => m.group !== "casual")
              .map((m) => (
                <option key={m.key} value={m.key}>
                  {m.name}
                </option>
              ))}
            <option value="other">Not on website</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select name="sort" defaultValue={query.sort} className={control}>
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
          <button type="submit" className="flex-1 rounded-md bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:bg-steel-100">
            Apply
          </button>
          <Link href="/admin/members" className="flex-1 px-3 py-2.5 text-center text-xs uppercase tracking-[0.2em] text-steel-300 hover:text-paper">
            Reset
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="mt-12 text-sm text-steel-300">
          {all.length === 0 ? "No one has bought a membership yet." : "No one matches those filters."}
        </p>
      ) : (
        <>
          {/* Phone: one card per member */}
          <ul className="mt-6 space-y-3 lg:hidden">
            {rows.map((m) => (
              <li key={m.rowId} className={`border bg-ink-soft p-4 ${m.status === "payment_failed" ? "border-ember/60" : "border-paper/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <MemberName member={m} />
                  <Badges m={m} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3 text-sm">
                  <MembershipLabel membership={m.membership} idSuffix={`c-${m.rowId}`} />
                  <span className="text-right">
                    <NextPayment member={m} />
                  </span>
                </div>
                <div className="mt-3 grid gap-1 text-sm text-steel-200">
                  <Phone phone={m.phone} />
                  <Email email={m.email} />
                </div>
                <p className="mt-3 text-xs text-steel-400">
                  Since {shortDate(m.memberSince)} · Paid {money(m.totalPaid)}
                </p>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-6 hidden lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-[4.25rem] z-10 bg-ink">
                <tr className="border-b border-paper/15 text-[0.65rem] uppercase tracking-[0.2em] text-steel-400">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="py-3 pr-4 font-semibold">Membership</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Next payment</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Email</th>
                  <th className="py-3 pr-4 font-semibold">Since</th>
                  <th className="py-3 pr-4 font-semibold">Last paid</th>
                  <th className="py-3 text-right font-semibold">Total paid</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.rowId} className="border-b border-paper/10 align-top hover:bg-ink-soft">
                    <td className="py-3.5 pr-4">
                      <MemberName member={m} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <MembershipLabel membership={m.membership} idSuffix={`t-${m.rowId}`} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badges m={m} />
                    </td>
                    <td className="py-3.5 pr-4">
                      <NextPayment member={m} />
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-steel-200">
                      <Phone phone={m.phone} />
                    </td>
                    <td className="max-w-[16rem] py-3.5 pr-4 text-steel-200">
                      <Email email={m.email} />
                    </td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-steel-200">{shortDate(m.memberSince)}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4 text-steel-200">{shortDate(m.lastPaymentAt)}</td>
                    <td className="whitespace-nowrap py-3.5 text-right text-paper">{money(m.totalPaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
