"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex items-center gap-6">
      {links.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              active ? "border-ember text-paper" : "border-transparent text-steel-300 hover:text-paper"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
