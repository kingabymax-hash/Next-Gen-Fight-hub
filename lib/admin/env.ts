import "server-only";
import { z } from "zod";

/**
 * Admin-only environment, validated lazily on the first /admin request so the
 * static build (and the public site) never needs these set.
 *
 * STRIPE_SECRET_KEY is the existing restricted key that created the Payment Links.
 * It can write, so lib/admin/stripe.ts only ever sends GET requests with it.
 */
const adminSchema = z.object({
  STRIPE_SECRET_KEY: z.string().regex(/^(sk|rk)_(live|test)_/, "must be a Stripe secret or restricted key"),
  ADMIN_PASSWORD: z.string().min(16, "must be at least 16 characters"),
  ADMIN_SESSION_SECRET: z.string().min(32, "must be at least 32 characters"),
});

export type AdminEnv = z.infer<typeof adminSchema>;

let _env: AdminEnv | null = null;

/** Null when admin is not configured; callers render a "not configured" state. */
export function getAdminEnv(): AdminEnv | null {
  if (_env) return _env;
  const parsed = adminSchema.safeParse(process.env);
  if (!parsed.success) {
    console.warn(
      "[admin] not configured:",
      parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; "),
    );
    return null;
  }
  _env = parsed.data;
  return _env;
}

export function requireAdminEnv(): AdminEnv {
  const env = getAdminEnv();
  if (!env) throw new Error("Admin environment is not configured.");
  return env;
}
