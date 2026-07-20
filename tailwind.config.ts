import type { Config } from "tailwindcss";

// Mobile-first (Tailwind default). Next Gen Fight Hub is a strictly monochrome brand:
// black / white / cool greys, no colour accents. Tokens below are the whole palette.
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
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
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
