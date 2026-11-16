import type { Metadata } from "next";

/**
 * Member check-in, reached by scanning the QR code at the door
 * (spec: specs/2026-11-16-qr-checkin). Dynamic, never indexed, not in the nav.
 */
export const metadata: Metadata = {
  title: "Check in",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function CheckInLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-ink">{children}</div>;
}
