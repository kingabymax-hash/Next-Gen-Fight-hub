import type { Metadata } from "next";

/**
 * Private, read-only members area for Hayden (spec: specs/2026-11-09-member-dashboard).
 * Never indexed, never prerendered, never linked from the public site.
 */
export const metadata: Metadata = {
  title: { default: "Members", template: "%s · Next Gen admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
