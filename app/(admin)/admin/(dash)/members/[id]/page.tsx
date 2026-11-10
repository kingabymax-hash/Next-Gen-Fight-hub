import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Email, Flag, Kicker, MembershipLabel, NextPayment, Phone, StatusBadge } from "@/components/admin/bits";
import { money, shortDate } from "@/lib/admin/format";
import { getMemberDetail } from "@/lib/admin/members";

export const metadata: Metadata = { title: "Member" };

const paymentStatus: Record<string, string> = {
  paid: "Paid",
  open: "Unpaid",
  uncollectible: "Failed",
  void: "Void",
};

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^cus_[A-Za-z0-9]+$/.test(id)) notFound();
  const detail = await getMemberDetail(id);
  if (!detail) notFound();
  const { member, rows, history, payments } = detail;

  return (
    <>
      <Link href="/admin/members" className="text-xs uppercase tracking-[0.2em] text-steel-400 hover:text-paper">
        ← All members
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-[0.95] sm:text-6xl">{member.name}</h1>
          {member.youthMemberName ? (
            <p className="mt-3 text-sm text-steel-200">
              Paying for <span className="text-paper">{member.youthMemberName}</span>
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {rows.map((r) => (
              <StatusBadge key={r.rowId} status={r.status} endsAt={r.endsAt} />
            ))}
            {member.duplicate ? <Flag>Duplicate</Flag> : null}
          </div>
        </div>
        <a
          href={member.stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-paper/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          Open in Stripe
        </a>
      </div>

      {member.duplicate ? (
        <p className="mt-6 max-w-2xl border-l-2 border-ember pl-4 text-sm leading-relaxed text-steel-200">
          This person has more than one membership running, so they may be paying twice. Check
          in Stripe and cancel the one they no longer use.
        </p>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="space-y-10">
          <section>
            <Kicker className="mb-4">Contact</Kicker>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-steel-400">Phone</dt>
                <dd className="mt-0.5 text-paper">
                  <Phone phone={member.phone} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-steel-400">Email</dt>
                <dd className="mt-0.5 text-paper">
                  <Email email={member.email} />
                </dd>
              </div>
            </dl>
            {member.detailsSource === "stripe" ? (
              <p className="mt-4 text-xs leading-relaxed text-steel-400">
                Joined before the website collected details, so these come from Stripe.
              </p>
            ) : null}
          </section>

          <section>
            <Kicker className="mb-4">Summary</Kicker>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-steel-400">Member since</dt>
                <dd className="mt-0.5 text-paper">{shortDate(member.memberSince)}</dd>
              </div>
              <div>
                <dt className="text-xs text-steel-400">Last payment</dt>
                <dd className="mt-0.5 text-paper">{shortDate(member.lastPaymentAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-steel-400">Next payment</dt>
                <dd className="mt-0.5">
                  <NextPayment member={member} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-steel-400">Total paid</dt>
                <dd className="mt-0.5 font-display text-3xl leading-none text-paper">{money(member.totalPaid)}</dd>
              </div>
            </dl>
          </section>

          <section>
            <Kicker className="mb-4">Memberships</Kicker>
            <ul className="divide-y divide-paper/10 border-y border-paper/10">
              {history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <MembershipLabel membership={h.membership} idSuffix={h.id} />
                    <span className="mt-1 block text-xs text-steel-400">
                      {shortDate(h.startedAt)}
                      {h.endedAt ? ` to ${shortDate(h.endedAt)}` : " to now"}
                    </span>
                  </span>
                  <StatusBadge status={h.status} endsAt={h.endsAt} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section>
          <Kicker className="mb-4">Payments</Kicker>
          {payments.length === 0 ? (
            <p className="text-sm text-steel-300">No payments yet.</p>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-paper/15 text-[0.65rem] uppercase tracking-[0.2em] text-steel-400">
                  <th className="py-2.5 pr-3 font-semibold">Date</th>
                  <th className="hidden py-2.5 pr-3 font-semibold sm:table-cell">For</th>
                  <th className="py-2.5 pr-3 font-semibold">Status</th>
                  <th className="py-2.5 pr-3 text-right font-semibold">Amount</th>
                  <th className="py-2.5 text-right font-semibold">
                    <span className="sr-only">Receipt</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-paper/10">
                    <td className="whitespace-nowrap py-3 pr-3 text-steel-200">{shortDate(p.date)}</td>
                    <td className="hidden py-3 pr-3 text-steel-200 sm:table-cell">{p.membershipLabel ?? "-"}</td>
                    <td className={`py-3 pr-3 ${p.status === "paid" ? "text-steel-200" : p.status === "void" ? "text-steel-500" : "text-ember"}`}>
                      {paymentStatus[p.status] ?? p.status}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-3 text-right text-paper">{money(p.amount)}</td>
                    <td className="py-3 text-right">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.16em] text-steel-300 hover:text-ember">
                          Receipt
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
