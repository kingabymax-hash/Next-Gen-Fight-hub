import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { Kicker, StatusBadge } from "@/components/admin/bits";
import { StatTile } from "@/components/admin/StatTile";
import { buttonClasses } from "@/components/ui/Button";
import { getDayLog, shiftDay } from "@/lib/admin/checkins";
import { searchMembersForDesk, statusLabels } from "@/lib/admin/members";
import { requireSession } from "@/lib/admin/session";
import { isAllowed } from "@/lib/checkin/checkin";
import { londonDay, photoKey, photosExist } from "@/lib/checkin/store";
import { MemberPhoto } from "@/components/admin/MemberPhoto";
import { checkInByHand } from "./actions";

export const metadata: Metadata = { title: "Front desk" };

/*
 * Elise's screen. Keep it open on the desk tablet: it refreshes itself, newest
 * check-in on top, and anyone the door turned away is marked in ember so they get
 * stopped for a word. Members without their phone are checked in by hand below.
 */

type Search = Promise<{ day?: string; q?: string; done?: string; result?: string; error?: string }>;

const timeOf = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(ms);

const dayLabel = (day: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(
    new Date(`${day}T12:00:00Z`),
  );

const control =
  "w-full rounded-md border border-paper/20 bg-ink px-3 py-2.5 text-base text-paper focus:border-ember focus:outline-none sm:text-sm";

function Banner({ done, result, error }: { done?: string; result?: string; error?: string }) {
  if (error) {
    return (
      <p role="status" className="mt-6 border-l-2 border-ember pl-4 text-sm text-steel-200">
        {error === "stripe" ? "Could not reach Stripe. Try again in a moment." : "That member could not be found."}
      </p>
    );
  }
  if (!done) return null;
  const text =
    result === "refused"
      ? `${done} is not paid up. Logged, but not let in: check their membership.`
      : result === "already"
        ? `${done} was already checked in.`
        : `${done} is checked in.`;
  return (
    <p role="status" className={`mt-6 border-l-2 pl-4 text-sm ${result === "refused" ? "border-ember text-ember" : "border-paper/40 text-paper"}`}>
      {text}
    </p>
  );
}

export default async function FrontDeskPage({ searchParams }: { searchParams: Search }) {
  // Owners and the receptionists' desk login both land here. Desk sees names,
  // membership and status only: no links into member pages, money or contact details.
  const role = await requireSession();
  const params = await searchParams;
  const today = londonDay();
  const day = params.day && /^\d{4}-\d{2}-\d{2}$/.test(params.day) && params.day <= today ? params.day : today;
  const isToday = day === today;
  const q = (params.q ?? "").trim().slice(0, 100);

  const [log, matches] = await Promise.all([
    getDayLog(day),
    isToday && q ? searchMembersForDesk(q) : null,
  ]);

  // Faces: the point of the desk screen is matching the person at the door to the
  // membership on their phone.
  const entries = log.entries ?? [];
  const keyOf = (customerId: string, name: string) => photoKey(customerId, name);
  const photos =
    (await photosExist([
      ...entries.map((e) => keyOf(e.customerId, e.name)),
      ...(matches ?? []).map((m) => keyOf(m.customerId, m.name)),
    ])) ?? new Set<string>();
  // The newest check-in gets a big photo for a couple of minutes, while they are
  // still standing at the desk.
  const latest = isToday && entries[0] && Date.now() - entries[0].at < 3 * 60_000 ? entries[0] : null;

  return (
    <>
      {isToday ? <AutoRefresh /> : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-3">Front desk</p>
          <h1 className="text-5xl leading-[0.95] sm:text-6xl">{isToday ? "Who's in today" : dayLabel(day)}</h1>
          {isToday ? <p className="mt-3 text-sm text-steel-300">{dayLabel(day)} · updates by itself</p> : null}
        </div>
        <nav aria-label="Day" className="flex items-center gap-2">
          <Link href={`/admin/front-desk?day=${shiftDay(day, -1)}`} className={buttonClasses("outline")}>
            ← Day before
          </Link>
          {!isToday ? (
            <Link href="/admin/front-desk" className={buttonClasses("outline")}>
              Today
            </Link>
          ) : null}
        </nav>
      </div>

      {!log.configured ? (
        <p className="mt-8 max-w-2xl border-l-2 border-ember pl-4 text-sm leading-relaxed text-steel-200">
          The check-in log is not connected yet, so scans show members their tick but are not
          recorded here. Add an Upstash Redis database in Vercel to switch it on.
        </p>
      ) : log.entries === null ? (
        <p className="mt-8 max-w-2xl border-l-2 border-ember pl-4 text-sm text-steel-200">
          Could not read the check-in log just now. It will retry by itself.
        </p>
      ) : null}

      <Banner done={params.done} result={params.result} error={params.error} />

      {latest ? (
        <section aria-label="Just checked in" className={`mt-10 flex flex-wrap items-center gap-6 rounded-md border p-5 sm:p-6 ${isAllowed(latest.status) ? "border-paper/20" : "border-ember"}`}>
          <MemberPhoto photoKey={keyOf(latest.customerId, latest.name)} has={photos.has(keyOf(latest.customerId, latest.name))} name={latest.name} size="lg" />
          <div className="min-w-0">
            <Kicker className="mb-2">Just checked in · {timeOf(latest.at)}</Kicker>
            <p className="font-display text-5xl uppercase leading-[0.95] text-paper">{latest.name}</p>
            <p className="mt-2 text-sm text-steel-300">
              {latest.membershipLabel}
              {latest.className ? ` · ${latest.className}` : ""}
            </p>
            <p className={`mt-4 text-sm font-semibold ${isAllowed(latest.status) ? "text-paper" : "text-ember"}`}>
              {isAllowed(latest.status)
                ? photos.has(keyOf(latest.customerId, latest.name))
                  ? "Paid up. Check the face matches."
                  : "Paid up. No photo yet: they take one on their next scan."
                : `${statusLabels[latest.status]}. Not let in: have a word.`}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile label="Checked in" value={String(log.checkedIn)} note={isToday ? "So far today" : undefined} />
        <StatTile
          label="See the desk"
          value={String(log.turnedAway)}
          note={log.turnedAway ? "Not paid up" : "Everyone paid up"}
          attention={log.turnedAway > 0}
        />
        <StatTile
          label="Busiest class"
          value={log.byClass[0] ? String(log.byClass[0].count) : "-"}
          note={log.byClass[0]?.name ?? "No check-ins yet"}
        />
        <StatTile label="By QR code" value={String((log.entries ?? []).filter((e) => e.via === "qr" && isAllowed(e.status)).length)} note="No hand check-in needed" />
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <section>
          <Kicker className="mb-4">Check-ins</Kicker>
          {(log.entries ?? []).length === 0 ? (
            <p className="text-sm text-steel-300">{isToday ? "Nobody yet. They appear here as they scan in." : "Nobody checked in that day."}</p>
          ) : (
            <ul className="divide-y divide-paper/10 border-y border-paper/10">
              {(log.entries ?? []).map((e) => {
                const ok = isAllowed(e.status);
                return (
                  <li key={`${e.at}-${e.subscriptionId}`} className="grid grid-cols-[3.5rem_3rem_1fr] items-center gap-x-4 py-3">
                    <span className={`pl-1 font-display text-xl leading-tight tabular-nums ${ok ? "text-steel-300" : "text-ember"}`}>{timeOf(e.at)}</span>
                    <MemberPhoto photoKey={keyOf(e.customerId, e.name)} has={photos.has(keyOf(e.customerId, e.name))} name={e.name} />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {role === "owner" ? (
                          <Link
                            href={`/admin/members/${e.customerId}`}
                            className="font-semibold text-paper underline-offset-4 hover:text-ember hover:underline"
                          >
                            {e.name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-paper">{e.name}</span>
                        )}
                        {ok ? null : <StatusBadge status={e.status} />}
                      </span>
                      <span className="mt-0.5 block text-xs text-steel-400">
                        {e.membershipLabel}
                        {e.className ? ` · ${e.className}` : ""}
                        {` · ${e.via === "qr" ? "QR code" : "By hand"}`}
                        {ok ? "" : ` · ${statusLabels[e.status]}, not let in`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {log.byClass.length > 1 ? (
            <div className="mt-10">
              <Kicker className="mb-4">By class</Kicker>
              <ul className="space-y-2 text-sm">
                {log.byClass.map((c) => (
                  <li key={c.name} className="flex justify-between border-b border-paper/10 pb-2">
                    <span className="text-steel-200">{c.name}</span>
                    <span className="font-display text-lg leading-none text-paper">{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {isToday ? (
          <section>
            <Kicker className="mb-2">Check in by hand</Kicker>
            <p className="mb-4 text-sm text-steel-300">For anyone without their phone.</p>
            <form method="get" className="flex gap-2">
              <label htmlFor="q" className="sr-only">
                Name, phone or email
              </label>
              <input id="q" name="q" defaultValue={q} placeholder="Name, phone or email" className={control} />
              <button type="submit" className={buttonClasses("outline")}>
                Find
              </button>
            </form>
            {matches ? (
              matches.length === 0 ? (
                <p className="mt-4 text-sm text-steel-300">No current member matches that.</p>
              ) : (
                <ul className="mt-4 divide-y divide-paper/10 border-y border-paper/10">
                  {matches.map((m) => (
                    <li key={m.rowId} className="flex items-center justify-between gap-3 py-3">
                      <MemberPhoto photoKey={keyOf(m.customerId, m.name)} has={photos.has(keyOf(m.customerId, m.name))} name={m.name} />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="block font-semibold text-paper">{m.name}</span>
                        <span className="mt-0.5 block text-xs text-steel-300">{m.membershipLabel}</span>
                        {m.status === "payment_failed" ? (
                          <span className="mt-1 block">
                            <StatusBadge status={m.status} />
                          </span>
                        ) : null}
                      </span>
                      <form action={checkInByHand}>
                        <input type="hidden" name="subscriptionId" value={m.rowId} />
                        <button type="submit" className="whitespace-nowrap rounded-md border border-paper/25 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-paper hover:text-ink">
                          Check in
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
