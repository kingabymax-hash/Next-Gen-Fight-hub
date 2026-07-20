import Link from "next/link";

/**
 * Shared button styling for the Next Gen look on the dark ground: squared,
 * uppercase, letter-spaced, monochrome. One source of truth so the whole site
 * restyles from here.
 *
 * - primary: solid white on ink (the loud CTA)
 * - outline: hairline border, paper text, fills on hover
 * - ghost:   quiet text link with an underline reveal
 */
type Variant = "primary" | "outline" | "ghost";

export function buttonClasses(variant: Variant = "primary", full = false): string {
  const base =
    "inline-flex items-center justify-center px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";
  const width = full ? "w-full" : "";
  const styles =
    variant === "primary"
      ? "bg-paper text-ink hover:bg-steel-100"
      : variant === "ghost"
        ? "px-0 py-1 text-steel-200 hover:text-paper"
        : "border border-paper/25 text-paper hover:bg-paper hover:text-ink";
  return `${base} ${width} ${styles}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  full = false,
  external = false,
  children,
}: {
  href: string;
  variant?: Variant;
  full?: boolean;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className = buttonClasses(variant, full);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
