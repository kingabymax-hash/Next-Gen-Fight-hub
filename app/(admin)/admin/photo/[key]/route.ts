import { NextResponse, type NextRequest } from "next/server";
import { sessionRole } from "@/lib/admin/session";
import { getPhoto, isPhotoKey } from "@/lib/checkin/store";

export const dynamic = "force-dynamic";

/**
 * Serves a member's check-in selfie to signed-in staff only (owner or desk). Never
 * public, never cached by a shared cache, never shown on the member's own phone.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!(await sessionRole())) return new NextResponse("Not found", { status: 404 });
  const { key } = await params;
  if (!isPhotoKey(key)) return new NextResponse("Not found", { status: 404 });
  const photo = await getPhoto(key);
  if (!photo) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(photo.jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
