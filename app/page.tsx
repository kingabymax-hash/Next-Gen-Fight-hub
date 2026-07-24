import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/icons";
import { site } from "@/lib/site/config";
import { timetable, slotRange } from "@/lib/site/timetable";
import { coaches } from "@/lib/site/coaches";
import { galleryImages } from "@/lib/site/media";

const disciplines = ["Muay Thai", "Boxing", "K1", "MMA", "Strength & Conditioning", "Open Gym"];

export default function HomePage() {
  const today = timetable[0]!; // preview one day on the home teaser

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="The Next Gen Fight Hub team in front of the ring"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_65%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <Container className="relative pb-16 sm:pb-24">
          <p className="kicker mb-6">Muay Thai · Boxing · K1 · MMA · Basildon</p>
          <h1 className="max-w-4xl text-6xl leading-[0.9] sm:text-8xl lg:text-9xl">
            Train. Hard.
            <br />
            Fight. Evolve.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-steel-100">
            A fight gym for everyone in Basildon. Juniors to adults, first-timers to fighters.
            Try any class for £10 and see the room for yourself.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/memberships" variant="primary">
              Try a class for £10
            </ButtonLink>
            <ButtonLink href="/timetable" variant="outline">
              View the timetable
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* DISCIPLINES marquee-ish strip */}
      <div className="border-y border-paper/10 py-6">
        <Container>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {disciplines.map((d) => (
              <li key={d} className="font-display text-lg uppercase tracking-tight text-steel-300">
                {d}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* INTRO */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="text-4xl leading-tight sm:text-6xl lg:col-span-8">
              Real coaching.
              <br />
              Every level. Every night.
            </h2>
            <p className="text-base leading-relaxed text-steel-200 lg:col-span-4">
              {site.subTagline} Learn from fighters who have genuinely done it, in a room built to
              push you.
            </p>
          </div>
        </Container>
      </Section>

      {/* TIMETABLE teaser */}
      <Section divide>
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="kicker mb-4">Timetable</p>
              <h2 className="text-3xl sm:text-5xl">{today.label} at Next Gen</h2>
            </div>
            <Link href="/timetable" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 hover:text-paper sm:inline-flex">
              Full week <ArrowIcon />
            </Link>
          </div>
          <ul className="mt-10 divide-y divide-paper/10 border-y border-paper/10">
            {today.slots.map((slot, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
                <span className="w-40 font-display text-2xl leading-none text-paper">{slotRange(slot)}</span>
                <span className="text-base text-steel-100">{slot.name}</span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-steel-500">
                  {slot.discipline}
                  {slot.note ? ` · ${slot.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/timetable" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 hover:text-paper sm:hidden">
            Full week <ArrowIcon />
          </Link>
        </Container>
      </Section>

      {/* MEMBERSHIPS teaser */}
      <Section divide>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="kicker mb-4">Memberships</p>
              <h2 className="text-3xl sm:text-5xl">From £35 a month. No joining fee.</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-steel-200">
                Four tiers from Bronze to unlimited Platinum, plus Muay Thai and Boxing memberships,
                and a £10 drop-in whenever you just want to train.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <ButtonLink href="/memberships" variant="primary">
                See memberships
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* COACHES teaser */}
      <Section divide>
        <Container>
          <p className="kicker mb-4">The team</p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            {coaches.map((c) => (
              <span key={c.name} className="font-display text-3xl uppercase tracking-tight text-paper sm:text-5xl">
                {c.name}
                <span className="mx-3 text-steel-600">/</span>
              </span>
            ))}
          </div>
          <Link href="/coaches" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 hover:text-paper">
            Meet the coaches <ArrowIcon />
          </Link>
        </Container>
      </Section>

      {/* MEDIA teaser */}
      <Section divide>
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {galleryImages.slice(0, 4).map((img) => (
              <Link key={img.src} href="/media" className="relative aspect-square overflow-hidden bg-ink-soft">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* CLOSING CTA */}
      <Section divide>
        <Container>
          <h2 className="max-w-3xl text-4xl leading-tight sm:text-7xl">
            Your first class is £10. Come and find out.
          </h2>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/memberships" variant="primary">
              Try a class for £10
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Find the gym
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
