/**
 * Photography assets. Web-optimised stills live in /public/images.
 *
 * Three sets, each with a different job:
 *   - `gymImages`     the room itself, used on About and Memberships so people can see
 *                     what they are walking into before they ever turn up.
 *   - `galleryImages` the Media page portfolio: training, fight nights, the team.
 *   - `featureVideo`  an optional hero clip, null until Hayden picks one.
 *
 * `width`/`height` are the real pixel dimensions of the file. The Media page lays the
 * gallery out in masonry columns at natural aspect ratio, so it needs them; keep them
 * accurate when you swap a file (ffprobe -show_entries stream=width,height).
 */

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** The facility. Ordered roughly as you would walk through the place. */
export const gymImages = {
  floor: {
    src: "/images/gym/floor.jpg",
    alt: "The main training floor at Next Gen Fight Hub, ring on the left and heavy bags on the right under hexagon lights",
    width: 1162,
    height: 784,
  },
  ring: {
    src: "/images/gym/ring.jpg",
    alt: "The full size boxing ring at Next Gen Fight Hub",
    width: 1159,
    height: 756,
  },
  bagsWide: {
    src: "/images/gym/bags-wide.jpg",
    alt: "Heavy bag row running the length of the gym beside the ring",
    width: 1195,
    height: 780,
  },
  bags: {
    src: "/images/gym/bags.jpg",
    alt: "Next Gen branded heavy bags hanging in a row",
    width: 1170,
    height: 1752,
  },
  fromTheRing: {
    src: "/images/gym/from-the-ring.jpg",
    alt: "The gym floor seen from inside the ring, bags and kit shelving along the wall",
    width: 1183,
    height: 758,
  },
  corner: {
    src: "/images/gym/corner.jpg",
    alt: "A padded ring corner and the round timer on the wall",
    width: 1202,
    height: 1417,
  },
  lounge: {
    src: "/images/gym/lounge.jpg",
    alt: "The seating area at Next Gen Fight Hub, black sofas and a good vibes neon sign",
    width: 1182,
    height: 782,
  },
  reception: {
    src: "/images/gym/reception.jpg",
    alt: "The reception desk at Next Gen Fight Hub with the lit club crest behind it",
    width: 1132,
    height: 738,
  },
  kitWall: {
    src: "/images/gym/kit-wall.jpg",
    alt: "Shelving stacked with pads, gloves and shin guards for members to use",
    width: 1171,
    height: 540,
  },
  wallPads: {
    src: "/images/gym/wall-pads.jpg",
    alt: "Wall mounted body pads on the black brick wall",
    width: 1173,
    height: 734,
  },
  neon: {
    src: "/images/gym/neon.jpg",
    alt: "Good vibes neon sign on the black brick wall",
    width: 1165,
    height: 710,
  },
  lightbox: {
    src: "/images/gym/lightbox.jpg",
    alt: "The lit Next Gen Fight Hub crest",
    width: 1166,
    height: 1479,
  },
  shrine: {
    src: "/images/gym/shrine.jpg",
    alt: "A Buddha figure on the reception counter",
    width: 1158,
    height: 1733,
  },
  changing: {
    src: "/images/gym/changing.jpg",
    alt: "The changing rooms at Next Gen Fight Hub, tiled with sinks, mirrors and hair dryers",
    width: 1162,
    height: 1745,
  },
} satisfies Record<string, Photo>;

/** The full team shot, used where the point is the people rather than the room. */
export const teamPhoto: Photo = {
  src: "/images/team.jpg",
  alt: "The Next Gen Fight Hub team lined up in front of the ring",
  width: 1200,
  height: 1600,
};

/**
 * Media page portfolio. Ordered for the masonry grid: mixed shapes next to each other
 * read better than a run of the same crop, so training, fight nights and team shots
 * are deliberately interleaved rather than grouped.
 */
export const galleryImages: Photo[] = [
  {
    src: "/images/media/pads-kick-2.jpg",
    alt: "A fighter throwing a high kick onto the pads under the hexagon lights",
    width: 1028,
    height: 1800,
  },
  {
    src: "/images/media/boxing-drill.jpg",
    alt: "Boxing coaching on the body pad beside the heavy bags at Next Gen Fight Hub",
    width: 930,
    height: 1214,
  },
  {
    src: "/images/media/pads-close.jpg",
    alt: "Close up of a fighter working combinations on the pads",
    width: 1184,
    height: 1184,
  },
  {
    src: "/images/media/team-belt.jpg",
    alt: "Members of the Next Gen team in the gym with a championship belt",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/media/fight-night-exchange.jpg",
    alt: "A Next Gen fighter exchanging in the ring in competition",
    width: 1290,
    height: 1284,
  },
  {
    src: "/images/media/ring-apron.jpg",
    alt: "Head coach Hayden sat on the ring apron with the pads beside him",
    width: 1259,
    height: 710,
  },
  {
    src: "/images/media/pads-punch.jpg",
    alt: "A fighter driving a straight punch into the pads",
    width: 1010,
    height: 1800,
  },
  {
    src: "/images/media/fight-night-decision.jpg",
    alt: "The referee raising a Next Gen fighter's hand after the decision",
    width: 1226,
    height: 1134,
  },
  {
    src: "/images/media/pads-teep.jpg",
    alt: "Pad work in the ring at Next Gen Fight Hub",
    width: 1290,
    height: 1573,
  },
  {
    src: "/images/media/fight-night-team.jpg",
    alt: "A Next Gen fighter and coach after a win on fight night",
    width: 1426,
    height: 1800,
  },
  {
    src: "/images/media/ring-portrait.jpg",
    alt: "Head coach Hayden in the ring holding the pads",
    width: 994,
    height: 994,
  },
  {
    src: "/images/media/pads-kick-1.jpg",
    alt: "A member landing a body kick on the pads during a session",
    width: 1290,
    height: 1577,
  },
  {
    src: "/images/media/fight-night-embrace.jpg",
    alt: "A Next Gen fighter and his coach embracing in the ring after the fight",
    width: 1274,
    height: 1274,
  },
  {
    src: "/images/media/wraps.jpg",
    alt: "Hands being wrapped backstage before a fight",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/media/pads-kick-3.jpg",
    alt: "Kicking the pads in the ring at Next Gen Fight Hub",
    width: 1218,
    height: 1532,
  },
  {
    src: "/images/media/fight-night-medal.jpg",
    alt: "A Next Gen fighter in the ring with his medal after the win",
    width: 1192,
    height: 1192,
  },
  {
    src: "/images/media/pads-kick-4.jpg",
    alt: "A member kicking the pads during an adult Muay Thai session",
    width: 1290,
    height: 1583,
  },
  {
    src: "/images/media/fight-night-corner.jpg",
    alt: "The corner team working on a Next Gen fighter between rounds",
    width: 1280,
    height: 1270,
  },
  {
    src: "/images/media/pads-kick-5.jpg",
    alt: "Pad work in the ring under the Next Gen banners",
    width: 1290,
    height: 1583,
  },
  {
    src: "/images/media/fight-night-celebration.jpg",
    alt: "A Next Gen fighter celebrating in the ring with his arm raised",
    width: 1162,
    height: 1162,
  },
  {
    src: "/images/media/fight-night-podium.jpg",
    alt: "A Next Gen fighter being presented with his medal in the ring",
    width: 1184,
    height: 1184,
  },
];

/**
 * Optional hero video clip (muted, looping). Null for now: the available drone
 * footage was not strong enough to ship. Hayden to pick a good training clip and it
 * gets compressed (ffmpeg, ~1080p muted MP4) into /public/video/gym.mp4, then set:
 *   export const featureVideo = { src: "/video/gym.mp4", poster: "/images/gym/floor.jpg" };
 */
export const featureVideo: { src: string; poster: string } | null = null;
