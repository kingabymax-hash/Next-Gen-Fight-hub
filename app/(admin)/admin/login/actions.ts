"use server";

import { redirect } from "next/navigation";
import { endSession, homeFor, roleForPassword, startSession } from "@/lib/admin/session";

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const role = password ? roleForPassword(password) : null;
  if (!role) {
    // Slows guessing. No rate limiter: serverless instances share no memory.
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "That password is not right." };
  }
  await startSession(role);
  redirect(homeFor(role));
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
