import type { Metadata, Viewport } from "next";
import { Anton, Changa_One, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site/config";

// Display: ultra-bold condensed for big uppercase headings, matching the flyer
// wordmark energy. Body: Inter.
const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
// Brand: heavy, flared, slightly condensed face, the closest free match to the
// emblem's "NEXT GEN / FIGHT HUB" lettering. Used only for the header/footer wordmark.
const brand = Changa_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Next Gen Fight Hub — Muay Thai, Boxing & MMA in Basildon",
    template: "%s · Next Gen Fight Hub",
  },
  description:
    "Muay Thai, Boxing, K1 and MMA in Basildon, Essex. Train. Hard. Fight. Evolve. Juniors to adults, beginners to fighters. Try a class for £10.",
  openGraph: {
    title: "Next Gen Fight Hub",
    description:
      "Muay Thai, Boxing, K1 and MMA in Basildon, Essex. Train. Hard. Fight. Evolve.",
    type: "website",
    url: site.url,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0C",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${brand.variable} ${body.variable}`}>
      {/* The public site's header and footer live in app/(site)/layout.tsx so the
          private /admin area can carry its own shell. */}
      <body>{children}</body>
    </html>
  );
}
