import type { Metadata, Viewport } from "next";
import { Anton, Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

// Display: ultra-bold condensed for big uppercase headings, matching the flyer
// wordmark energy. Body: Inter.
const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
// Brand: heavy, slightly extended block grotesque matching the emblem's
// "NEXT GEN / FIGHT HUB" lettering. Used only for the header/footer wordmark.
const brand = Archivo_Black({
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
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
