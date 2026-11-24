/**
 * Membership cancellation policy (Hayden, 24 Nov 2026): 30 days' notice for ALL
 * recurring memberships. Shown at the bottom of /memberships inside a
 * "Cancellation policy" button that opens in place. Native <details>, no JS.
 */
const POINTS = [
  "Members must provide a minimum of 30 days' written notice to cancel their membership.",
  "Any membership payments due within the 30-day notice period will remain payable, subject to applicable statutory rights.",
  "Members will retain access to the facilities and their included training sessions until their membership expires.",
  "Failure to attend training does not automatically cancel a membership.",
  "Cancelling a payment method does not constitute formal membership cancellation.",
  "Cancellation requests must be submitted through an approved membership cancellation channel or directly to Next Gen Fight Hub in writing.",
  "Membership payments are non-refundable except where required by law.",
];

export function CancellationPolicy() {
  return (
    <details id="cancellation-policy" className="group border border-steel-700">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-steel-100 transition-colors hover:text-ember [&::-webkit-details-marker]:hidden">
        Cancellation policy
        <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-steel-700 px-5 py-6 text-sm leading-relaxed text-steel-200">
        <h3 className="mb-3 text-lg text-paper">Next Gen Fight Hub: Membership Cancellation Policy</h3>
        <p>
          All recurring memberships purchased online through Stripe are subject to a 30-day
          cancellation notice period.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mt-4">
          By purchasing a recurring membership, members acknowledge and agree to these
          cancellation terms, without affecting their statutory consumer rights.
        </p>
        <p className="mt-4 text-steel-300">Next Gen Fight Hub Ltd · www.nextgenfighthub.com</p>
      </div>
    </details>
  );
}
