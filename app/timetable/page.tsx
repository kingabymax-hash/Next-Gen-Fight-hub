import type { Metadata } from "next";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { TimetableExplorer } from "@/components/site/TimetableExplorer";
import { site } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Timetable",
  description:
    "The full weekly class timetable at Next Gen Fight Hub, Basildon: Juniors, Cadets and Adult Muay Thai, Boxing, MMA, Strength & Conditioning and Open Gym. Tap a class to see who takes it.",
};

export default function TimetablePage() {
  return (
    <>
      <PageHeader
        kicker="— Timetable"
        title={<>The week</>}
        lead="Juniors to adults, beginners to fighters. All levels welcome. Tap any class to see who takes it and what to expect."
      />

      <Section>
        <Container>
          <TimetableExplorer />

          <p className="mt-8 text-xs uppercase tracking-[0.15em] text-steel-500">
            Boxing sessions marked TRB run in partnership with Top Rope Boxing. First class is £10,
            paid on the day at the gym.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/memberships" variant="primary">
              See memberships
            </ButtonLink>
            <ButtonLink href={site.whatsapp.url} variant="outline" external>
              <WhatsAppIcon className="mr-3 h-4 w-4" />
              Message us on WhatsApp
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
