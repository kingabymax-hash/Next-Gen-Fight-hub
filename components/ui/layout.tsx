import type { ReactNode } from "react";

/** Centered max-width gutter wrapper. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-screen-2xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/** Vertical section rhythm, optionally hairline-divided at the top. */
export function Section({
  children,
  className = "",
  divide = false,
}: {
  children: ReactNode;
  className?: string;
  divide?: boolean;
}) {
  return (
    <section className={`py-16 sm:py-24 ${divide ? "hairline" : ""} ${className}`}>
      {children}
    </section>
  );
}

/**
 * Standard page header: kicker + big title + optional lead.
 *
 * `aside` parks something in the top right of the header, opposite the title (the
 * Contact page uses it for the club crest). It sits below the copy on mobile-first
 * narrow screens and only moves alongside it once there is room.
 */
/** Section heading in the ember accent, sentence case, as on the Contact page. */
export function SectionHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-sans text-3xl font-semibold normal-case tracking-tight text-ember ${className}`}>{children}</h2>;
}

export function PageHeader({
  kicker,
  title,
  lead,
  aside,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="pt-12 sm:pt-16">
      <Container>
        <div className="flex flex-col gap-10 border-b border-paper/15 pb-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12 sm:pb-12">
          <div>
            <p className="mb-4 text-lg font-semibold text-ember">{kicker}</p>
            <h1 className="max-w-4xl text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
            {lead ? (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel-100 sm:text-lg">{lead}</p>
            ) : null}
          </div>
          {aside ? <div className="shrink-0 sm:pt-2">{aside}</div> : null}
        </div>
      </Container>
    </header>
  );
}
