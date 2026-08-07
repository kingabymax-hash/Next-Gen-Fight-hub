import type { Metadata } from "next";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { MembershipCard } from "@/components/site/MembershipCard";
import { membershipsByGroup } from "@/lib/site/memberships";
import { isConfigured, paymentUrl } from "@/lib/site/payments";

export const metadata: Metadata = {
  title: "Memberships",
  description:
    "Next Gen Fight Hub memberships: Bronze £35, Silver £50, Muay Thai £85, Boxing £85, Gold £90, Platinum £100, plus a £10 drop-in and day pass. No joining fee.",
};

export default function MembershipsPage() {
  const portalLive = isConfigured("portal");

  return (
    <>
      <PageHeader
        kicker="— Memberships"
        title={<>Pick your<br />way in</>}
        lead="No joining fee, no lock-in. Not sure yet? Try any class for £10 and see the room for yourself."
      />

      {/* General tiers */}
      <Section>
        <Container>
          <p className="kicker mb-8">The tiers</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {membershipsByGroup.tier.map((m) => (
              <MembershipCard key={m.key} membership={m} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Discipline-specific */}
      <Section divide>
        <Container>
          <p className="kicker mb-3">Train one thing</p>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-steel-200">
            Focused memberships for a single discipline, sitting alongside the tiers. Boxing runs
            in partnership with Top Rope Boxing.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
            {membershipsByGroup.discipline.map((m) => (
              <MembershipCard key={m.key} membership={m} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Casual */}
      <Section divide>
        <Container>
          <p className="kicker mb-3">Just visiting</p>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-steel-200">
            No membership needed. Pay as you go and come in whenever it suits you.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
            {membershipsByGroup.casual.map((m) => (
              <MembershipCard key={m.key} membership={m} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Members: manage / portal */}
      <Section divide>
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl">Already a member?</h2>
              <p className="mt-2 max-w-md text-sm text-steel-200">
                Manage your membership, update your card, or cancel any time through the secure
                billing portal.
              </p>
            </div>
            {portalLive ? (
              <a
                href={paymentUrl("portal")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold uppercase tracking-[0.18em] text-steel-200 underline-offset-4 hover:text-paper hover:underline"
              >
                Manage membership
              </a>
            ) : (
              <span className="text-sm uppercase tracking-[0.18em] text-steel-500">
                Portal coming soon
              </span>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
