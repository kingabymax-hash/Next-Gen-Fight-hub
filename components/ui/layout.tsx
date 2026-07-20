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

/** Standard page header: kicker + big title + optional lead. */
export function PageHeader({
  kicker,
  title,
  lead,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <header className="pt-16 sm:pt-24">
      <Container>
        <p className="kicker mb-5">{kicker}</p>
        <h1 className="max-w-4xl text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
        {lead ? (
          <p className="mt-6 max-w-xl text-base leading-relaxed text-steel-200">{lead}</p>
        ) : null}
      </Container>
    </header>
  );
}
