import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { JoinForm } from "@/components/site/JoinForm";
import { TierStars } from "@/components/site/TierStars";
import { memberships, priceLabel, type Membership } from "@/lib/site/memberships";
import { isConfigured, paymentUrl } from "@/lib/site/payments";

/**
 * /join/[key]: the details step between "Join now" and Stripe checkout, one static
 * page per online membership. Casual passes are sold at the gym and have no page.
 */

function joinable(m: Membership): boolean {
  return m.group !== "casual" && isConfigured(m.key);
}

function find(key: string): Membership | undefined {
  return memberships.find((m) => m.key === key && joinable(m));
}

export const dynamicParams = false;

export function generateStaticParams() {
  return memberships.filter(joinable).map((m) => ({ key: m.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const membership = find((await params).key);
  if (!membership) return {};
  return {
    title: `Join: ${membership.name}`,
    description: `Join Next Gen Fight Hub on the ${membership.name} membership, ${priceLabel(membership)}. No joining fee.`,
    robots: { index: false },
  };
}

export default async function JoinPage({ params }: { params: Promise<{ key: string }> }) {
  const membership = find((await params).key);
  if (!membership) notFound();

  const youth = membership.group === "youth";

  return (
    <>
      <PageHeader
        kicker="— Join"
        title={membership.name}
        lead={
          youth
            ? "A few details about you and the member, then you pay securely with Stripe."
            : "A few details so we know who you are, then you pay securely with Stripe."
        }
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            {/* What they are buying */}
            <aside className="h-fit border border-paper/15 p-8">
              <p className="kicker mb-4">Your membership</p>
              <h2 className="text-3xl">{membership.name}</h2>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl leading-none text-paper">
                  £{membership.price}
                </span>
                <span className="text-sm text-steel-300">/mo</span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-steel-200">{membership.summary}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-steel-200">
                {membership.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 bg-steel-300" />
                    {item}
                  </li>
                ))}
              </ul>
              {membership.stars ? (
                <TierStars tier={membership.key} count={membership.stars} className="mt-6 !justify-start" />
              ) : null}
              <p className="mt-6 text-[0.7rem] uppercase tracking-[0.15em] text-steel-500">
                No joining fee · cancel any time
              </p>
              <Link
                href="/memberships"
                className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-steel-300 underline-offset-4 hover:text-ember hover:underline"
              >
                Change membership
              </Link>
            </aside>

            <div className="max-w-lg">
              <p className="kicker mb-6">Your details</p>
              <JoinForm paymentLink={paymentUrl(membership.key)} youth={youth} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
