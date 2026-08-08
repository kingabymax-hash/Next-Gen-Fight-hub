import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Next Gen Fight Hub is a Muay Thai, Boxing and MMA gym in Basildon, Essex, founded by head coach Hayden. Fitness, technique, community.",
};

const ethos = [
  { word: "Train.", line: "Every level, every night of the week. Juniors to fighters, first-timers to pros." },
  { word: "Hard.", line: "Real coaching and honest work. You get out what you put in, and we push you." },
  { word: "Fight.", line: "Muay Thai, boxing, K1 and MMA under one roof, with coaches who have done it." },
  { word: "Evolve.", line: "Come for fitness, stay for the craft. Leave a better version of yourself." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="— About"
        title={<>More than<br />a gym</>}
        lead="Next Gen Fight Hub is a Muay Thai, Boxing and MMA gym in Basildon, Essex. Fitness. Technique. Community."
      />

      {/* Intro + image */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 text-base leading-relaxed text-steel-200 lg:col-span-6">
              <p>
                We built Next Gen for everyone who wants to learn to fight properly, whatever
                their starting point. Kids finding their first combinations, adults chasing
                fitness, and competitors sharpening for the ring all train under the same roof.
              </p>
              <p>
                The gym is led by head coach Hayden, who has spent thirteen years on the pads
                across Muay Thai, boxing, K1 and MMA. Around him is a team of specialist coaches,
                each bringing their own discipline, so you learn from people who have genuinely
                done it.
              </p>
              <p>
                Come for the fitness, stay for the craft. That is the whole idea.
              </p>
            </div>
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
                <Image
                  src="/images/hero.jpg"
                  alt="The Next Gen Fight Hub team together in the gym in front of the ring"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Ethos */}
      <Section divide>
        <Container>
          <p className="kicker mb-10">{site.tagline}</p>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ethos.map((e) => (
              <div key={e.word}>
                <h2 className="font-display text-4xl text-paper">{e.word}</h2>
                <p className="mt-4 text-sm leading-relaxed text-steel-200">{e.line}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pad Guy cross-link (subtle) */}
      <Section divide>
        <Container>
          <div className="max-w-2xl">
            <p className="kicker mb-4">From the head coach</p>
            <p className="text-base leading-relaxed text-steel-200">
              Hayden also runs{" "}
              <a
                href={site.padGuy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper underline underline-offset-4 hover:text-steel-100"
              >
                The Pad Guy Programme
              </a>
              , an online course teaching you how to hold pads properly, wherever you are. Different
              thing to the gym, same standard.
            </p>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section divide>
        <Container>
          <h2 className="text-4xl sm:text-6xl">Come and train.</h2>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/memberships" variant="primary">
              Try a class for £10
            </ButtonLink>
            <ButtonLink href="/timetable" variant="outline">
              See the timetable
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
