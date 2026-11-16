"use server";

import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/admin/session";
import { deletePhoto, isPhotoKey } from "@/lib/checkin/store";

/** Owner only: clear a check-in photo so the member takes a fresh one next scan. */
export async function clearPhoto(formData: FormData): Promise<void> {
  await requireOwner();
  const key = String(formData.get("key") ?? "");
  const customerId = key.split("_").slice(0, 2).join("_");
  if (!isPhotoKey(key)) redirect("/admin/members");
  await deletePhoto(key);
  redirect(`/admin/members/${customerId}?photo=cleared`);
}
