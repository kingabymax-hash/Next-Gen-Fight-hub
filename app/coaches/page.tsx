import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { coaches, coachMonogram, type Coach } from "@/lib/site/coaches";
import { InstagramIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Coaches",
  description:
    "Meet the coaching team at Next Gen Fight Hub: Muay Thai, Boxing, K1 and MMA coaches led by head coach Hayden.",
};

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <article className="flex flex-col border border-paper/15">
      {/* Photo or monogram placeholder, portrait 4:5 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-soft">
        {coach.photo ? (
          <Image
            src={coach.photo}
            alt={`${coach.name}, ${coach.disciplines.join(" / ")} coach at Next Gen Fight Hub`}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden="true"
              className="font-display text-6xl uppercase tracking-tight text-steel-600"
            >
              {coachMonogram(coach.name)}
            </span>
          </div>
        )}
        {coach.headCoach ? (
          <span className="absolute left-4 top-4 bg-paper px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ink">
            Head coach
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-2xl">{coach.name}</h2>
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-steel-400">
          {coach.disciplines.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </p>
        <div className="mt-4 flex-1 space-y-3 text-sm leading-relaxed text-steel-200">
          {coach.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <a
          href={coach.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 hover:text-paper"
        >
          <InstagramIcon className="h-4 w-4" />
          {coach.instagramHandle}
        </a>
      </div>
    </article>
  );
}

export default function CoachesPage() {
  return (
    <>
      <PageHeader
        kicker="— The team"
        title={<>Coaches</>}
        lead="Real fighters and specialist coaches across Muay Thai, boxing, K1 and MMA. Led from the front by head coach Hayden."
      />

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => (
              <CoachCard key={coach.name} coach={coach} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
