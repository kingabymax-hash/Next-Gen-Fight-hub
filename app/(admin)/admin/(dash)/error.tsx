"use client";

/** Shown when Stripe cannot be read (outage, revoked key). Never shows the raw error. */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-md py-12">
      <p className="kicker mb-4">Members</p>
      <h1 className="text-4xl">Could not reach Stripe</h1>
      <p className="mt-4 text-sm leading-relaxed text-steel-200">
        The member list comes live from Stripe, and that request failed. Try again in a minute.
        If it keeps happening, the Stripe key may have been changed.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 border border-paper/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-paper hover:bg-paper hover:text-ink"
      >
        Try again
      </button>
    </div>
  );
}
