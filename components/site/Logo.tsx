import Link from "next/link";

/**
 * Text lockup placeholder for the crossed-gloves badge + wordmark. Swap for the
 * real logo asset when Hayden supplies it (drop an SVG/PNG in /public and render it
 * here). Kept as type so it always looks clean at any size.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 ${className}`} aria-label="Next Gen Fight Hub, home">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 font-display text-sm leading-none text-paper transition-colors group-hover:border-paper"
      >
        NG
      </span>
      <span className="font-display text-lg uppercase leading-none tracking-tight text-paper">
        Next Gen
        <span className="text-steel-300"> Fight Hub</span>
      </span>
    </Link>
  );
}
