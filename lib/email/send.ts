import "server-only";
import { Resend } from "resend";
import { getServerEnv, contactEmailConfigured } from "@/lib/config/env";
import type { EmailContent } from "@/lib/email/templates";

/**
 * Email send layer, the only place that talks to Resend. `safeSendEmail` is
 * best-effort and NEVER throws: the contact form is a side-effect, and a Resend
 * hiccup (or a not-yet-configured key) must degrade to a "DM us" fallback, not a
 * 500. Returns true on success, false otherwise.
 */
let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  _resend = new Resend(getServerEnv().RESEND_API_KEY);
  return _resend;
}

export async function safeSendEmail(
  to: string | null | undefined,
  content: EmailContent,
  replyTo?: string,
): Promise<boolean> {
  if (!to) return false;
  if (!contactEmailConfigured()) {
    console.warn("[email] not configured (missing RESEND_API_KEY / EMAIL_FROM / CONTACT_TO_EMAIL); skipping send.");
    return false;
  }
  try {
    const { EMAIL_FROM } = getServerEnv();
    const { error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error(`[email] send to ${to} failed: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(`[email] send to ${to} threw: ${message}`);
    return false;
  }
}
