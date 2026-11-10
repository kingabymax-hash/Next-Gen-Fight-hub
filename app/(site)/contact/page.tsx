import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { ContactForm } from "@/components/site/ContactForm";
import { site } from "@/lib/site/config";
import { openingHours } from "@/lib/site/timetable";
import { InstagramIcon, TikTokIcon, FacebookIcon, WhatsAppIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find Next Gen Fight Hub at Unit 5 Bowlers Croft, Basildon, Essex, SS14 3DU. Opening hours, map, socials and a message form.",
};

export default function ContactPage() {
  const hours = openingHours();

  return (
    <>
      <PageHeader
        kicker="— Contact"
        title={<>Find us</>}
        lead="Drop in, message us on WhatsApp, or come and watch a class. We are easy to find in Basildon."
        aside={
          /*
           * logo-mark.png is the crest keyed out of its near-black tile (alpha built
           * from the source luminance), so it sits on the page ink as the mark alone
           * with no visible square edge. Decorative: the club name is already in the
           * nav and the footer, so it stays out of the accessibility tree.
           */
          <Image
            src="/images/logo-mark.png"
            alt=""
            aria-hidden="true"
            width={640}
            height={640}
            sizes="(min-width: 1024px) 11rem, 7rem"
            className="h-28 w-28 lg:h-44 lg:w-44"
          />
        }
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-2">
            {/* Left: details */}
            <div>
              <p className="kicker mb-4">Where</p>
              <address className="not-italic text-lg leading-relaxed text-paper">
                {site.address.line1}
                <br />
                {site.address.city}, {site.address.county}
                <br />
                {site.address.postcode}
              </address>
              <a
                href={site.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 transition-colors hover:text-ember"
              >
                Open in Google Maps
              </a>

              <p className="kicker mb-4 mt-12">Opening hours</p>
              <ul className="space-y-2">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between border-b border-paper/10 py-2 text-sm">
                    <span className="text-steel-200">{h.day}</span>
                    <span className="text-paper">{h.range}</span>
                  </li>
                ))}
              </ul>

              <p className="kicker mb-4 mt-12">WhatsApp</p>
              <p className="max-w-sm text-base leading-relaxed text-steel-200">
                The quickest way to reach us. Message the gym and Hayden will get back to you.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <ButtonLink href={site.whatsapp.url} variant="whatsapp" external>
                  <WhatsAppIcon className="mr-3 h-4 w-4" />
                  Message us on WhatsApp
                </ButtonLink>
                <a
                  href={`tel:+${site.whatsapp.e164}`}
                  className="text-sm text-steel-200 hover:text-paper"
                >
                  {site.whatsapp.display}
                </a>
              </div>

              <p className="kicker mb-4 mt-12">Follow</p>
              <div className="flex items-center gap-5 text-steel-300">
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href={site.socials.tiktok} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="TikTok">
                  <TikTokIcon />
                </a>
                <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <span className="text-xs uppercase tracking-[0.18em] text-steel-400">{site.socials.handle}</span>
              </div>
            </div>

            {/* Right: form */}
            <div>
              <p className="kicker mb-6">Send a message</p>
              <ContactForm />
            </div>
          </div>

          {/* Map */}
          <div className="mt-16 aspect-[16/9] w-full overflow-hidden border border-paper/15">
            <iframe
              title="Map to Next Gen Fight Hub"
              src={site.mapEmbedSrc}
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
