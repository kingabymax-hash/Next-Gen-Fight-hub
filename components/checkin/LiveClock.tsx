"use client";

import { useEffect, useState } from "react";

/**
 * A ticking clock on the result screen, so the front desk can tell a live check-in
 * from a screenshot of an old one at a glance.
 */
export function LiveClock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <p className={className}>&nbsp;</p>;
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  return (
    <p className={className} aria-live="off">
      <span className="block font-display text-5xl tabular-nums leading-none">{time}</span>
      <span className="mt-2 block text-sm">{date}</span>
    </p>
  );
}
