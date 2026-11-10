"use server";

import { z } from "zod";
import { getServerEnv, contactEmailConfigured } from "@/lib/config/env";
import { safeSendEmail } from "@/lib/email/send";
import { contactMessageEmail } from "@/lib/email/templates";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email address"),
  message: z.string().trim().min(1, "Please enter a message").max(4000),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level errors keyed by field name. */
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

/**
 * Contact form Server Action. Validates, then emails the gym via safeSendEmail.
 * Email never throws; if it is not configured or fails, we tell the user to DM us
 * instead of pretending it sent.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "message";
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { status: "error", message: "Please check the form and try again.", errors };
  }

  if (!contactEmailConfigured()) {
    return {
      status: "error",
      message: "Our contact form is not live yet. Please message us on WhatsApp for now:",
    };
  }

  const { CONTACT_TO_EMAIL } = getServerEnv();
  const ok = await safeSendEmail(
    CONTACT_TO_EMAIL,
    contactMessageEmail(parsed.data),
    parsed.data.email,
  );

  if (!ok) {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please message us on WhatsApp instead:",
    };
  }

  return { status: "success", message: "Thanks. We will get back to you soon." };
}
