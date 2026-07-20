/**
 * Media gallery assets. Web-optimised stills live in /public/images and the
 * compressed clip in /public/video (see the build's media step). Add/replace here.
 */

export type GalleryImage = { src: string; alt: string; wide?: boolean };

export const galleryImages: GalleryImage[] = [
  { src: "/images/gym-hex.jpg", alt: "Pad work under the ring lights at Next Gen Fight Hub", wide: true },
  { src: "/images/gym-ring.jpg", alt: "Holding pads for a fighter in the ring" },
  { src: "/images/gym-gritty.jpg", alt: "Coaching a fighter through kicks on the pads" },
  { src: "/images/fight.jpg", alt: "A Next Gen fighter landing a straight right in competition", wide: true },
  { src: "/images/spar.jpg", alt: "Sparring in the ring at Next Gen Fight Hub" },
];

/**
 * Optional hero video clip (muted, looping). Null for now: the available drone
 * footage was not strong enough to ship. Hayden to pick a good training clip and it
 * gets compressed (ffmpeg, ~1080p muted MP4) into /public/video/gym.mp4, then set:
 *   export const featureVideo = { src: "/video/gym.mp4", poster: "/images/gym-hex.jpg" };
 */
export const featureVideo: { src: string; poster: string } | null = null;
