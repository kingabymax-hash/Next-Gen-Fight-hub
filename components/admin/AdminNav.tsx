"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Role } from "@/lib/admin/session";

const links: { href: string; label: string; desk?: boolean }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/front-desk", label: "Front desk", desk: true },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/qr", label: "QR code" },
];

/** The receptionists' login sees the front desk only, so they get no nav at all. */
export function AdminNav({ role }: { role: Role }) {
  const path = usePathname();
  if (role === "desk") return null;
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {links.filter((l) => role === "owner" || l.desk).map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              active ? "text-paper" : "text-steel-300 hover:text-paper"
            }`}
          >
            {l.label}
            {active ? (
              <span aria-hidden="true" className="absolute -bottom-2 left-1/2 -ml-[0.1em] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ember" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
