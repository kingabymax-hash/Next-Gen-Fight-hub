import "server-only";
import { z } from "zod";

/**
 * Server-only, lazily validated environment access.
 *
 * This site is static-first: the ONLY runtime secrets are for the contact form
 * (Resend). Stripe is handled entirely by hosted Payment Links (public URLs in
 * lib/site/payments.ts), so there is no Stripe secret or webhook here. The site's
 * own URL is a plain constant with an optional env override (see lib/site/config.ts),
 * so `next build` needs no environment variables at all.
 *
 * Validation is lazy (first send) so the static build never trips on a missing key.
 */

const serverSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  CONTACT_TO_EMAIL: z.string().email(),
});

let _serverEnv: z.infer<typeof serverSchema> | null = null;

export function getServerEnv(): z.infer<typeof serverSchema> {
  if (_serverEnv) return _serverEnv;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid contact-form environment variables:\n${detail}`);
  }
  _serverEnv = parsed.data;
  return _serverEnv;
}

/** True when the contact form has real credentials (used to no-op gracefully otherwise). */
export function contactEmailConfigured(): boolean {
  return serverSchema.safeParse(process.env).success;
}
