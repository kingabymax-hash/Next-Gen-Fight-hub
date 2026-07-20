import type { Metadata } from "next";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { timetable, slotRange, type ClassSlot } from "@/lib/site/timetable";

export const metadata: Metadata = {
  title: "Timetable",
  description:
    "The full weekly class timetable at Next Gen Fight Hub, Basildon: Juniors, Cadets and Adult Muay Thai, Boxing, MMA, Strength & Conditioning and Open Gym.",
};

function DisciplineTag({ slot }: { slot: ClassSlot }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-steel-400">
      {slot.discipline}
      {slot.note ? <span className="text-steel-500">· {slot.note}</span> : null}
    </span>
  );
}

export default function TimetablePage() {
  return (
    <>
      <PageHeader
        kicker="— Timetable"
        title={<>The week</>}
        lead="Juniors to adults, beginners to fighters. All levels welcome. Drop in for £10 or come as a member."
      />

      <Section>
        <Container>
          {/* Desktop: 7-column grid. Mobile: stacked per day. */}
          <div className="grid grid-cols-1 gap-px bg-paper/10 md:grid-cols-2 lg:grid-cols-7">
            {timetable.map((day) => (
              <div key={day.key} className="bg-ink p-5">
                <h2 className="mb-5 font-display text-xl uppercase tracking-tight text-paper">
                  {day.label}
                </h2>
                <ul className="space-y-5">
                  {day.slots.map((slot, i) => (
                    <li key={i} className="border-l border-paper/15 pl-4">
                      <p className="font-display text-lg leading-none text-paper">
                        {slotRange(slot)}
                      </p>
                      <p className="mt-1.5 text-sm text-steel-200">{slot.name}</p>
                      <p className="mt-1">
                        <DisciplineTag slot={slot} />
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.15em] text-steel-500">
            Boxing sessions marked TRB run in partnership with Top Rope Boxing.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/memberships" variant="primary">
              Try a class for £10
            </ButtonLink>
            <ButtonLink href="/memberships" variant="outline">
              See memberships
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
