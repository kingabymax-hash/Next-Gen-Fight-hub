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
        lead="Pad work, sparring, fight nights and the people behind them. Have a scroll and see what a night at Next Gen actually looks like."
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

      {/*
        Portfolio grid. Masonry columns rather than a fixed tile grid: every shot keeps
        its own shape, so nothing gets its head cropped off and the wall reads as a
        photographer's set instead of a stack of thumbnails.
      */}
      <Section divide={!!featureVideo}>
        <Container>
          <div className="columns-2 gap-4 [column-fill:_balance] lg:columns-3 xl:columns-4">
            {galleryImages.map((img) => (
              <figure
                key={img.src}
                className="mb-4 break-inside-avoid overflow-hidden bg-ink-soft"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, 46vw"
                  className="h-auto w-full transition duration-500 hover:scale-[1.03]"
                />
              </figure>
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
