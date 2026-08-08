import type { PaymentKey } from "@/lib/site/payments";

/**
 * The rank badge under a general membership tier.
 *
 * This is the one place the site carries colour in the UI (see CLAUDE.md invariant 5).
 * The tiers are named after metals, so the stars are struck in those metals: without
 * that, Bronze and Gold are the same grey pip repeated and the ladder stops reading at
 * a glance. Each tone is a three-stop gradient rather than a flat fill, which is what
 * makes it look like metal catching the light instead of a coloured icon.
 *
 * Platinum is deliberately the odd one out: five stars rather than four, in a cool
 * near-white with a soft halo, so the top tier reads as a step up and not just one
 * more notch.
 */

type Tone = {
  id: string;
  stops: [string, string, string];
  glow?: string;
};

const TONES: Record<string, Tone> = {
  bronze: { id: "metal-bronze", stops: ["#E3A96F", "#C0703A", "#8A4A1E"] },
  silver: { id: "metal-silver", stops: ["#F2F4F7", "#B9C0C8", "#828A94"] },
  gold: { id: "metal-gold", stops: ["#F7DE8A", "#DDA82B", "#9C6B12"] },
  platinum: {
    id: "metal-platinum",
    stops: ["#FFFFFF", "#DCE4EC", "#FFFFFF"],
    glow: "0 0 6px rgba(226,236,247,0.55)",
  },
};

const STAR_PATH =
  "M12 2.4l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.42l-5.88 3.09 1.12-6.55L2.48 9.32l6.58-.96L12 2.4z";

export function TierStars({
  tier,
  count,
  className = "",
}: {
  tier: PaymentKey;
  count: number;
  className?: string;
}) {
  const tone = TONES[tier];
  if (!tone || count < 1) return null;

  const label = `${count} star${count === 1 ? "" : "s"}`;

  return (
    <p
      className={`flex items-center justify-center gap-1.5 ${className}`}
      aria-label={label}
    >
      {/* One gradient per tone; each tone renders once on the page. */}
      <svg width="0" height="0" aria-hidden="true" className="block h-0 w-0">
        <defs>
          <linearGradient id={tone.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone.stops[0]} />
            <stop offset="55%" stopColor={tone.stops[1]} />
            <stop offset="100%" stopColor={tone.stops[2]} />
          </linearGradient>
        </defs>
      </svg>

      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          style={tone.glow ? { filter: `drop-shadow(${tone.glow})` } : undefined}
        >
          <path d={STAR_PATH} fill={`url(#${tone.id})`} />
        </svg>
      ))}
    </p>
  );
}
