/**
 * Single source of truth for gym identity: name, address, socials, and the
 * cross-link to The Pad Guy. No secrets here (all public).
 */

// Canonical site URL. Overridable by env for previews; defaults to the live domain
// so `next build` needs no environment configuration.
export const site = {
  name: "Next Gen Fight Hub",
  shortName: "Next Gen",
  tagline: "Train. Hard. Fight. Evolve.",
  subTagline: "Fitness. Technique. Community.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nextgenfighthub.com",

  address: {
    line1: "Unit 5 Bowlers Croft",
    city: "Basildon",
    county: "Essex",
    postcode: "SS14 3DU",
  },

  // Google Maps place embed for the address (no API key needed for the standard embed).
  mapEmbedSrc:
    "https://www.google.com/maps?q=Unit+5+Bowlers+Croft+Basildon+SS14+3DU&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Unit+5+Bowlers+Croft+Basildon+SS14+3DU",

  /*
   * The gym WhatsApp. `display` is how it is written for a human, `e164` is the same
   * number in international form for wa.me and tel: links. Every "message us" button
   * on the site points at `url`, which opens WhatsApp with the greeting pre-filled.
   */
  whatsapp: {
    display: "07763 169961",
    e164: "447763169961",
    url: "https://wa.me/447763169961?text=Hi%20Next%20Gen%2C%20I%27d%20like%20to%20book%20a%20class",
  },

  socials: {
    instagram: "https://www.instagram.com/nextgenfighthub/",
    tiktok: "https://www.tiktok.com/@nextgenfighthub",
    facebook: "https://www.facebook.com/nextgenfighthub",
    handle: "@nextgenfighthub",
  },

  // Subtle cross-link to Hayden's separate online membership.
  padGuy: {
    name: "The Pad Guy Programme",
    url: "https://www.thepadguy.com",
    blurb: "Hayden's online pad-holding course. Learn to hold pads properly, wherever you are.",
  },
} as const;

export function addressOneLine(): string {
  const a = site.address;
  return `${a.line1}, ${a.city}, ${a.county}, ${a.postcode}`;
}
