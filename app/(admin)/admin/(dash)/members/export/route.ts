import { NextResponse, type NextRequest } from "next/server";
import { getAdminEnv } from "@/lib/admin/env";
import { hasSession } from "@/lib/admin/session";
import { filterMembers, getMembers, parseMembersQuery, statusLabels } from "@/lib/admin/members";
import { isoDate } from "@/lib/admin/format";
import { formatUkPhone } from "@/lib/site/joinDetails";

export const dynamic = "force-dynamic";

/** Quotes a CSV cell and defuses spreadsheet formulas (=, +, -, @ at the start). */
function cell(value: string | number | null): string {
  let s = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!getAdminEnv() || !(await hasSession())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const query = parseMembersQuery(Object.fromEntries(request.nextUrl.searchParams));
  const rows = filterMembers(await getMembers(), query);

  const header = ["Name", "Member's name", "Email", "Phone", "Membership", "Price per month", "Status", "Next payment", "Ends", "Member since", "Last payment", "Total paid", "Duplicate", "Stripe customer"];
  const lines = rows.map((m) =>
    [
      m.name,
      m.youthMemberName,
      m.email,
      m.phone ? formatUkPhone(m.phone) : null,
      m.membership.label,
      m.membership.pricePerMonth,
      statusLabels[m.status],
      isoDate(m.renewsAt),
      isoDate(m.endsAt),
      isoDate(m.memberSince),
      isoDate(m.lastPaymentAt),
      m.totalPaid,
      m.duplicate ? "Yes" : "",
      m.customerId,
    ]
      .map(cell)
      .join(","),
  );

  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="next-gen-members-${isoDate(new Date())}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
