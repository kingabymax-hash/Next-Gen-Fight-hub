import Link from "next/link";

export function StatTile({
  label,
  value,
  note,
  href,
  attention = false,
}: {
  label: string;
  value: string;
  note?: string;
  href?: string;
  attention?: boolean;
}) {
  const body = (
    <>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-steel-400">{label}</p>
      <p className={`mt-3 font-display text-4xl leading-none sm:text-5xl ${attention ? "text-ember" : "text-paper"}`}>{value}</p>
      {note ? <p className="mt-2 text-xs text-steel-400">{note}</p> : null}
    </>
  );
  const className = `block border bg-ink-soft p-5 sm:p-6 ${attention ? "border-ember/70" : "border-paper/10"}`;
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:border-paper/30`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
