/**
 * A member's check-in selfie, or a plain placeholder when there is none yet.
 * Served by /admin/photo/[key] to signed-in staff only.
 */
export function MemberPhoto({
  photoKey,
  has,
  name,
  size = "sm",
}: {
  photoKey: string;
  has: boolean;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "w-40 sm:w-48" : size === "md" ? "w-24" : "w-12";
  return (
    <span className={`relative block aspect-[4/5] shrink-0 overflow-hidden rounded-md border border-paper/15 bg-ink-soft ${box}`}>
      {has ? (
        // A private, per-request image: next/image would cache it in a shared optimiser.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/admin/photo/${photoKey}`} alt={`Check-in photo of ${name}`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className={`absolute inset-0 flex items-center justify-center text-center uppercase tracking-[0.14em] text-steel-500 ${size === "sm" ? "text-[0.5rem]" : "text-[0.65rem]"}`}>
          No photo
        </span>
      )}
    </span>
  );
}
