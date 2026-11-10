/**
 * Member details collected on /join/[key] before Stripe checkout.
 *
 * Stripe Payment Links have no URL slot for a name or phone number, so the details
 * ride in `client_reference_id`, which Stripe stores on the completed Checkout
 * Session. That field allows up to 200 characters of letters, digits, `-` and `_`,
 * which is exactly the base64url alphabet. The admin dashboard reads it back with
 * `unpackJoinDetails`.
 *
 * Format before encoding: "1|name|phone|memberName" (memberName empty for adults).
 * The leading version lets the format change later without breaking old members.
 *
 * Runs in the browser (join form) and on the server (dashboard): no Node-only APIs.
 */

export type JoinDetails = {
  name: string;
  /** E.164, e.g. +447763169961 */
  phone: string;
  /** The child's name, youth memberships only. */
  memberName?: string;
};

const VERSION = "1";
export const MAX_REFERENCE_LENGTH = 200;
export const MAX_NAME_LENGTH = 60;

function clean(value: string): string {
  return value.replace(/\|/g, " ").replace(/\s+/g, " ").trim();
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function packJoinDetails(details: JoinDetails): string {
  return toBase64Url(
    [VERSION, clean(details.name), clean(details.phone), clean(details.memberName ?? "")].join("|"),
  );
}

/** Never throws: a missing, hand-edited or garbled value returns null. */
export function unpackJoinDetails(reference: string | null | undefined): JoinDetails | null {
  if (!reference || !/^[A-Za-z0-9_-]+$/.test(reference)) return null;
  try {
    const parts = fromBase64Url(reference).split("|");
    if (parts.length !== 4 || parts[0] !== VERSION) return null;
    const [, name, phone = "", memberName] = parts;
    if (!name) return null;
    return { name, phone, ...(memberName ? { memberName } : {}) };
  } catch {
    return null;
  }
}

/**
 * Normalises a UK phone number to E.164 (+44...), or returns null if it is not one.
 * Accepts "07763 169961", "+44 7763 169961", "0044 7763 169961", "(01268) 123456".
 */
export function normaliseUkPhone(input: string): string | null {
  let digits = input.replace(/[\s().-]/g, "");
  if (digits.startsWith("+44")) digits = digits.slice(3);
  else if (digits.startsWith("0044")) digits = digits.slice(4);
  else if (digits.startsWith("44") && digits.length >= 11) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  else return null;
  if (digits.startsWith("0")) digits = digits.slice(1); // "+44 (0)7763..."
  if (!/^[1-9]\d{8,9}$/.test(digits)) return null;
  return `+44${digits}`;
}

/** "+447763169961" -> "07763 169961" for display. Leaves anything else as given. */
export function formatUkPhone(e164: string): string {
  const m = /^\+44(\d{4})(\d{6})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]}` : e164;
}
