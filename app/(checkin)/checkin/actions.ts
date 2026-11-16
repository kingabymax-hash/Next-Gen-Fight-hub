"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { findMembersByContact } from "@/lib/admin/members";
import { getAdminEnv } from "@/lib/admin/env";
import { forgetPass, readPass, writePass } from "@/lib/checkin/pass";
import { countLookup, isStoreConfigured, lookupAllowed, photoKey, savePhoto } from "@/lib/checkin/store";

export type LookupState = { error?: string; value?: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * First visit on a phone: find the member by the mobile or email they joined with,
 * remember them on this phone, then send them back to /checkin, which checks them in.
 */
export async function lookUp(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const value = String(formData.get("contact") ?? "").trim().slice(0, 120);
  if (!getAdminEnv()) return { value, error: "Check-in is not set up yet. Please see the front desk." };
  if (!value) return { value, error: "Type the mobile number or email you joined with." };

  const ip = await clientIp();
  if (!(await lookupAllowed(ip))) {
    return { value, error: "Too many tries. Please see the front desk." };
  }
  await countLookup(ip);

  let found;
  try {
    found = await findMembersByContact(value);
  } catch {
    return { value, error: "We could not check right now. Please see the front desk." };
  }
  if (found.length === 0) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      value,
      error: "We cannot find a membership with that. Try the number or email you joined with, or see the front desk.",
    };
  }

  await writePass(found.map((m) => ({ subscriptionId: m.subscriptionId, customerId: m.customerId, name: m.name })));
  redirect(found.length === 1 ? "/checkin" : "/checkin?pick=1");
}

export async function forgetThisPhone(): Promise<void> {
  await forgetPass();
  redirect("/checkin");
}

export type SelfieState = { error?: string };

/**
 * Saves the first-check-in selfie for one person on this phone's pass, then sends
 * them on to their tick. Only people already remembered on this phone can be given a
 * photo, and an existing photo is never replaced (an owner clears it to retake).
 * If the store is down the member still gets in: the door never waits on storage.
 */
export async function saveSelfie(_prev: SelfieState, formData: FormData): Promise<SelfieState> {
  const who = String(formData.get("who") ?? "");
  const raw = String(formData.get("photo") ?? "");
  const pass = await readPass();
  const entry = pass?.find((e) => e.subscriptionId === who);
  if (!entry) redirect("/checkin");
  if (!isStoreConfigured()) redirect(`/checkin?who=${entry.subscriptionId}`);

  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(raw);
  if (!match?.[1]) return { error: "That photo did not work. Please try again." };
  const result = await savePhoto(photoKey(entry.customerId, entry.name), Buffer.from(match[1], "base64"));
  if (result === "invalid") return { error: "That photo did not work. Please try again." };
  redirect(`/checkin?who=${entry.subscriptionId}`);
}
