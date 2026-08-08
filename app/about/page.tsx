import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site/config";
import { gymImages, teamPhoto } from "@/lib/site/media";

export const metadata: Metadata = {
  title: "About",
  description:
    "Next Gen Fight Hub is a Muay Thai, Boxing and MMA gym in Basildon, Essex, founded by head coach Hayden. Fitness, technique, community.",
};

/**
 * The tour: what someone actually walks into. Captions say what the thing is, so the
 * page works as an answer to "what is this place like" rather than a mood board.
 */
const tour = [
  { photo: gymImages.ring, caption: "A full size ring, used every night of the week." },
  { photo: gymImages.bagsWide, caption: "A long row of heavy bags, so nobody waits their turn." },
  { photo: gymImages.fromTheRing, caption: "Matted floor for pad work, drilling and grappling." },
  { photo: gymImages.kitWall, caption: "Pads, gloves and shins on the shelf. Borrow ours until you buy your own." },
  { photo: gymImages.lounge, caption: "Somewhere to sit, catch your breath and stay a while." },
  { photo: gymImages.reception, caption: "Reception, where your first £10 class starts." },
];

const details = [
  { photo: gymImages.bags, caption: "The bag room" },
  { photo: gymImages.changing, caption: "Proper changing rooms and showers" },
  { photo: gymImages.corner, caption: "Round timer on the wall" },
];

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
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink-soft">
                <Image
                  src={gymImages.floor.src}
                  alt={gymImages.floor.alt}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* The tour: what the room actually holds */}
      <Section divide>
        <Container>
          <div className="max-w-2xl">
            <p className="kicker mb-4">The gym</p>
            <h2 className="text-3xl sm:text-5xl">Have a look round.</h2>
            <p className="mt-5 text-base leading-relaxed text-steel-200">
              One room in Basildon, kitted out properly. A full ring, a wall of bags, matted
              floor and all the kit you need to get started.
            </p>
          </div>

          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {tour.map((item) => (
              <figure key={item.photo.src}>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-soft">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-4 text-sm leading-relaxed text-steel-200">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {details.map((item) => (
              <figure key={item.photo.src}>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-soft">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="(min-width: 640px) 31vw, 92vw"
                    className="object-cover object-center"
                  />
                </div>
                <figcaption className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-steel-400">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
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

      {/* The people, not the room */}
      <Section divide>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-soft">
                <Image
                  src={teamPhoto.src}
                  alt={teamPhoto.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-steel-200 lg:col-span-7">
              <p className="kicker">The room is only half of it</p>
              <p>
                The other half is who is in it. Juniors who turn up on a Monday and never
                stop, adults who came for the fitness and stayed for the craft, and fighters
                getting ready for a corner. They all train in the same room, on the same mats.
              </p>
              <p>
                Nobody here started good. Walk in, say hello, and someone will show you where
                to stand.
              </p>
            </div>
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
