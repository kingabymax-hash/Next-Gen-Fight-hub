import type { Metadata } from "next";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ContactForm } from "@/components/site/ContactForm";
import { site } from "@/lib/site/config";
import { openingHours } from "@/lib/site/timetable";
import { InstagramIcon, TikTokIcon, FacebookIcon } from "@/components/ui/icons";

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
        lead="Drop in, message us, or come and watch a class. We are easy to find in Basildon."
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
                className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-steel-300 hover:text-paper"
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

              <p className="kicker mb-4 mt-12">Follow</p>
              <div className="flex items-center gap-5 text-steel-300">
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-paper" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href={site.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-paper" aria-label="TikTok">
                  <TikTokIcon />
                </a>
                <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-paper" aria-label="Facebook">
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
