import type { Config } from "tailwindcss";

// Mobile-first (Tailwind default). Next Gen Fight Hub is a black / white / cool-grey
// brand carrying two accents and no more: `ember` for small highlights (kickers, active
// states, focus rings, the featured membership) and `whatsapp` for the WhatsApp buttons,
// which have to wear WhatsApp's own green to be recognised. Tokens below are the whole
// palette; the tier-star metallics in components/site/TierStars.tsx are the exception.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Near-black ink and off-white paper, plus a cool metallic grey ramp drawn
        // from the flyer's brushed-steel wordmark.
        ink: "#0B0B0C", // page black / dark surfaces / text
        "ink-soft": "#161719",
        paper: "#F6F6F7", // near-white
        "paper-dark": "#E9E9EB",
        steel: {
          100: "#D7D8DC",
          200: "#B4B6BC",
          300: "#8C8F97",
          400: "#6A6D75",
          500: "#4C4F56",
          600: "#33353B",
          700: "#212327",
        },
        // Ember: the one house accent. Warm orange against the cool, teal-lit gym
        // photography. Small doses only, and it clears 6:1 on ink for small text.
        ember: {
          DEFAULT: "#FF5A1F",
          soft: "#FF8552",
          deep: "#C2410C",
        },
        // WhatsApp's own brand green, used only on the buttons that open WhatsApp.
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1DA851",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        // Wordmark only: matches the lettering inside the logo emblem.
        brand: ["var(--font-brand)", "Arial Black", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        kicker: "0.28em",
      },
      maxWidth: {
        "screen-2xl": "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
