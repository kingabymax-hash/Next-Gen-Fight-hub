import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageHeader, Section } from "@/components/ui/layout";
import { ButtonLink } from "@/components/ui/Button";
import { galleryImages, featureVideo } from "@/lib/site/media";
import { site } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Inside Next Gen Fight Hub: pad work, sparring, fight nights and the room itself. Basildon, Essex.",
};

export default function MediaPage() {
  return (
    <>
      <PageHeader
        kicker="— Media"
        title={<>The room</>}
        lead="Pad work, sparring and fight nights. This is what a session at Next Gen looks like."
      />

      {/* Feature video */}
      {featureVideo ? (
        <Section>
          <Container>
            <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
              <video
                className="h-full w-full object-cover"
                src={featureVideo.src}
                poster={featureVideo.poster}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
              />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Photo grid */}
      <Section divide={!!featureVideo}>
        <Container>
          <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-2 gap-4 lg:grid-cols-4">
            {galleryImages.map((img) => (
              <div
                key={img.src}
                className={`relative overflow-hidden bg-ink-soft ${
                  img.wide ? "col-span-2 row-span-2" : ""
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={img.wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover object-center transition duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.15em] text-steel-500">
            More on Instagram, TikTok and Facebook {site.socials.handle}.
          </p>

          <div className="mt-10">
            <ButtonLink href="/memberships" variant="primary">
              See memberships
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
