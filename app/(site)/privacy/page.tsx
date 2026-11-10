import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { site } from "@/lib/site/config";

/*
 * Draft wording for Hayden to sign off before launch. Keep it plain and truthful:
 * it must describe exactly what the join step and the contact form collect.
 */

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Next Gen Fight Hub uses the details you give us when you join or get in touch.",
};

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "Who we are",
    body: (
      <>
        {site.name}, {site.address.line1}, {site.address.city}, {site.address.postcode}. We
        decide how your details are used, and you can reach us on WhatsApp at{" "}
        {site.whatsapp.display} or through the <Link href="/contact">contact page</Link>.
      </>
    ),
  },
  {
    heading: "What we collect",
    body: (
      <>
        When you join: your name, email address and phone number, and for Juniors and Cadets,
        the member&apos;s name. Your payment is taken by Stripe, so your card details go to
        Stripe and never to us. When you send a message through the contact form: your name,
        email and message.
      </>
    ),
  },
  {
    heading: "Why we use it",
    body: (
      <>
        To run your membership: to know who is training, to contact you about classes,
        payments or changes at the gym, and to answer your messages. We do not sell your
        details or use them for anyone else&apos;s marketing.
      </>
    ),
  },
  {
    heading: "Where it is kept",
    body: (
      <>
        Membership and payment details are held by Stripe, our payment provider, and only
        the gym can see them. Contact form messages arrive by email. We keep membership
        details while you are a member and for as long as the law requires for our accounts
        afterwards.
      </>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        You can ask to see the details we hold about you, have them corrected, or have them
        deleted once we no longer need them for your membership or our accounts. Message us
        and we will sort it. If you are unhappy with how we have handled your details, you
        can complain to the Information Commissioner&apos;s Office at ico.org.uk.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader kicker="Privacy" title="Your details" lead="What we collect, why, and what you can ask us to do with it." />
      <Section>
        <Container>
          <div className="max-w-2xl space-y-10">
            {sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-2xl">{s.heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-steel-200 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-paper">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
