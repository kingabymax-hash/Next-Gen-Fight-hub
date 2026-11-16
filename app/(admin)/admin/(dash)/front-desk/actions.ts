"use server";

import { redirect } from "next/navigation";
import { findDeskMember } from "@/lib/admin/members";
import { requireSession } from "@/lib/admin/session";
import { checkIn } from "@/lib/checkin/checkin";

/** Front desk "check in by hand", for anyone without their phone. */
export async function checkInByHand(formData: FormData): Promise<void> {
  await requireSession();
  const rowId = String(formData.get("subscriptionId") ?? "");
  const member = await findDeskMember(rowId);
  if (!member) redirect("/admin/front-desk?error=notfound");
  const outcome = await checkIn(
    { subscriptionId: member.rowId, customerId: member.customerId, name: member.name },
    "desk",
  ).catch(() => null);
  if (!outcome) redirect("/admin/front-desk?error=stripe");
  const result = !outcome.allowed ? "refused" : outcome.record.kind === "already" ? "already" : "ok";
  redirect(`/admin/front-desk?done=${encodeURIComponent(outcome.name)}&result=${result}`);
}
