import { type Membership, priceLabel } from "@/lib/site/memberships";
import { isConfigured, paymentUrl } from "@/lib/site/payments";
import { buttonClasses } from "@/components/ui/Button";
import { TierStars } from "@/components/site/TierStars";

/**
 * One membership/pass card. The CTA is a plain link to the Stripe Payment Link when
 * configured; until Hayden's Stripe account is wired it shows a graceful "coming
 * soon" state instead of a dead link.
 */
export function MembershipCard({ membership }: { membership: Membership }) {
  const live = isConfigured(membership.key);
  const href = paymentUrl(membership.key);
  const featured = membership.featured;
  // Casual £10 passes are bought in person on the day, never online.
  const inPerson = membership.group === "casual";

  return (
    <div
      className={`flex flex-col border p-8 ${
        featured ? "border-paper bg-paper/[0.04]" : "border-paper/15"
      }`}
    >
      {featured ? (
        <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-paper">
          Most popular
        </p>
      ) : null}

      <h3 className="text-2xl sm:text-3xl">{membership.name}</h3>

      <p className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-5xl leading-none text-paper">
          £{membership.price}
        </span>
        <span className="text-sm text-steel-300">
          {membership.cadence === "month" ? "/mo" : "one-off"}
        </span>
      </p>

      <p className="mt-4 text-sm leading-relaxed text-steel-200">{membership.summary}</p>

      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-steel-200">
        {membership.includes.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-steel-300" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {inPerson ? (
          <span
            className={`${buttonClasses("outline", true)} pointer-events-none`}
            aria-disabled="true"
          >
            Pay at the gym
          </span>
        ) : live ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses(featured ? "primary" : "outline", true)}
          >
            {membership.cadence === "month" ? "Join now" : "Buy now"}
          </a>
        ) : (
          <span
            className={`${buttonClasses("outline", true)} pointer-events-none opacity-45`}
            aria-disabled="true"
          >
            Coming soon
          </span>
        )}
      </div>
      <p className="mt-3 text-center text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
        {inPerson ? `${priceLabel(membership)} · paid in person` : `${priceLabel(membership)} · no joining fee`}
      </p>

      {membership.stars ? (
        <TierStars tier={membership.key} count={membership.stars} className="mt-5" />
      ) : null}
    </div>
  );
}
