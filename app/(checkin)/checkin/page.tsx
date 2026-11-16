import Image from "next/image";
import { LiveClock } from "@/components/checkin/LiveClock";
import { LookupForm } from "@/components/checkin/LookupForm";
import { SelfieCapture } from "@/components/checkin/SelfieCapture";
import { isStoreConfigured, photoKey, photosExist } from "@/lib/checkin/store";
import { getAdminEnv } from "@/lib/admin/env";
import { checkIn, shortName, type CheckInOutcome } from "@/lib/checkin/checkin";
import { readPass, type PassEntry } from "@/lib/checkin/pass";
import { forgetThisPhone } from "./actions";

/*
 * What a member sees after scanning the QR code at the door.
 *
 *   First time on this phone  -> type mobile or email once (LookupForm)
 *   Remembered, one member    -> checked in straight away
 *   Remembered, several       -> "Who's training?" (a parent with juniors), then checked in
 *   No photo on file yet      -> a live selfie, once per person, before the first tick
 *
 * The result is built to be read from across the desk without a fourth colour
 * (CLAUDE.md invariant 5): let in is a black screen with a big ember tick; not let in
 * flips to a white screen with a black cross. A ticking clock proves it is live.
 */

type Search = Promise<{ pick?: string; who?: string }>;

const timeOf = (ms: number) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" }).format(ms);

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 py-10">
      <Image src="/images/logo.jpg" alt="Next Gen Fight Hub" width={96} height={96} priority className="h-14 w-14 object-contain" />
      <div className="flex flex-1 flex-col justify-center py-10">{children}</div>
    </main>
  );
}

function ForgetLink({ dark = true, label = "Not you? Use a different number" }: { dark?: boolean; label?: string }) {
  return (
    <form action={forgetThisPhone}>
      <button
        type="submit"
        className={`text-xs uppercase tracking-[0.2em] underline-offset-4 hover:underline ${dark ? "text-steel-400 hover:text-paper" : "text-steel-500 hover:text-ink"}`}
      >
        {label}
      </button>
    </form>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <p className="kicker mb-3">Check in</p>
      <h1 className="text-5xl leading-[0.95]">{title}</h1>
      <p className="mt-5 text-base leading-relaxed text-steel-200">{body}</p>
    </Shell>
  );
}

function Picker({ entries }: { entries: PassEntry[] }) {
  return (
    <Shell>
      <p className="kicker mb-3">Check in</p>
      <h1 className="mb-8 text-5xl leading-[0.95]">Who&rsquo;s training?</h1>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.subscriptionId}>
            {/* A plain link, not next/link: prefetching would check someone in. */}
            <a
              href={`/checkin?who=${e.subscriptionId}`}
              className="flex items-center justify-between rounded-md border border-paper/20 px-5 py-5 text-lg font-semibold text-paper transition-colors hover:border-ember"
            >
              {shortName(e.name)}
              <span aria-hidden="true" className="text-ember">→</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <ForgetLink />
      </div>
    </Shell>
  );
}

function SelfieStep({ entry, several }: { entry: PassEntry; several: boolean }) {
  return (
    <Shell>
      <p className="kicker mb-3">One time only</p>
      <h1 className="text-5xl leading-[0.95]">{several ? `Selfie for ${shortName(entry.name)}` : "Quick selfie"}</h1>
      <p className="mb-8 mt-4 text-base leading-relaxed text-steel-200">
        So the front desk can see it&rsquo;s really you. Only gym staff can see it, and you
        only do this once.
      </p>
      <SelfieCapture who={entry.subscriptionId} />
      <div className="mt-10 text-center">
        <ForgetLink />
      </div>
    </Shell>
  );
}

function Result({ outcome, several }: { outcome: CheckInOutcome; several: boolean }) {
  const { allowed, record } = outcome;
  const name = shortName(outcome.name);

  if (!allowed) {
    const reason =
      outcome.status === "payment_failed"
        ? "Your last membership payment did not go through."
        : "This membership is no longer active.";
    return (
      <main className="flex min-h-[100dvh] flex-col bg-paper px-5 py-10 text-ink">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center text-center">
          <svg viewBox="0 0 120 120" className="mx-auto h-36 w-36" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="6" />
            <path d="M40 40 L80 80 M80 40 L40 80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <h1 className="mt-8 text-6xl leading-[0.95]">See the front desk</h1>
          <p className="mt-5 text-xl font-semibold">{name}</p>
          <p className="mt-2 text-base text-steel-500">{reason}</p>
          <LiveClock className="mt-10 text-steel-600" />
        </div>
        <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-4">
          {several ? (
            <a href="/checkin?pick=1" className="text-xs uppercase tracking-[0.2em] text-steel-500 hover:text-ink">
              Check in someone else
            </a>
          ) : null}
          <ForgetLink dark={false} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] flex-col bg-ink px-5 py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center text-center">
        <div className="relative mx-auto h-40 w-40">
          {/* The ring keeps pulsing, so a screenshot looks dead next to a live screen. */}
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border-4 border-ember/60 [animation-duration:2s]" />
          <svg viewBox="0 0 120 120" className="relative h-40 w-40 text-ember" aria-hidden="true">
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="6" />
            <path d="M36 62 L53 79 L86 44" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-8 text-7xl leading-[0.9]">Checked in</h1>
        <p className="mt-5 text-2xl font-semibold text-paper">{name}</p>
        <p className="mt-2 text-base text-steel-300">
          {outcome.membershipLabel}
          {outcome.className ? ` · ${outcome.className}` : ""}
        </p>
        {record.kind === "already" ? (
          <p className="mt-3 text-sm text-steel-400">Already checked in at {timeOf(record.at)}</p>
        ) : null}
        <LiveClock className="mt-10 text-paper" />
        <p className="mt-8 text-sm text-steel-400">Show this screen at the desk. Train hard.</p>
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-4">
        {several ? (
          <a href="/checkin?pick=1" className="text-xs uppercase tracking-[0.2em] text-steel-400 hover:text-paper">
            Check in someone else
          </a>
        ) : null}
        <ForgetLink />
      </div>
    </main>
  );
}

export default async function CheckInPage({ searchParams }: { searchParams: Search }) {
  if (!getAdminEnv()) {
    return <Message title="Not set up yet" body="Check-in is not switched on yet. Please see the front desk." />;
  }

  const { pick, who } = await searchParams;
  const pass = await readPass();

  if (!pass) {
    return (
      <Shell>
        <p className="kicker mb-3">Welcome to Next Gen</p>
        <h1 className="mb-8 text-6xl leading-[0.95]">Check in</h1>
        <LookupForm />
      </Shell>
    );
  }

  const several = pass.length > 1;
  const chosen = several ? pass.find((e) => e.subscriptionId === who) : pass[0];
  if (!chosen || pick) return <Picker entries={pass} />;

  // First check-in for this person: take their photo before the tick. Skipped if the
  // store is not set up or cannot be read, so the door never waits on storage.
  if (isStoreConfigured()) {
    const key = photoKey(chosen.customerId, chosen.name);
    const have = await photosExist([key]);
    if (have && !have.has(key)) return <SelfieStep entry={chosen} several={several} />;
  }

  let outcome: CheckInOutcome | null = null;
  try {
    outcome = await checkIn(chosen, "qr");
  } catch {
    return <Message title="Try again" body="We could not reach the membership system. Please see the front desk." />;
  }
  if (!outcome) {
    return (
      <Shell>
        <p className="kicker mb-3">Check in</p>
        <h1 className="text-5xl leading-[0.95]">Membership not found</h1>
        <p className="mt-5 text-base leading-relaxed text-steel-200">Please see the front desk.</p>
        <div className="mt-10">
          <ForgetLink label="Use a different number" />
        </div>
      </Shell>
    );
  }
  return <Result outcome={outcome} several={several} />;
}
