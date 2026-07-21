"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { navLinks } from "@/components/site/nav";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Sticky top bar over the dark ground. The mobile menu is the one bit of client
 * state on the site; everything else is static.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-paper/10 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-paper" : "text-steel-300 hover:text-paper"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/memberships" className={buttonClasses("primary")}>
            Join
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center text-paper lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 bg-paper transition-transform ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 bg-paper transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 bg-paper transition-transform ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-menu" className="border-t border-paper/10 bg-ink lg:hidden" aria-label="Mobile">
          <div className="flex flex-col px-6 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b border-paper/5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-steel-200 hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/memberships" className={`${buttonClasses("primary", true)} mt-6`}>
              Join
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
