import { requireOwner } from "@/lib/admin/session";
import type { Metadata } from "next";
import Image from "next/image";
import QRCode from "qrcode";
import { PrintButton } from "@/components/admin/PrintButton";
import { site } from "@/lib/site/config";

export const metadata: Metadata = { title: "QR code" };

/**
 * The poster for the door. Prints on one A4 sheet; everything outside the poster is
 * hidden when printing (the admin header carries print:hidden).
 */
export default async function QrPage() {
  await requireOwner();
  const url = `${site.url.replace(/\/$/, "")}/checkin`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#0B0B0C", light: "#F6F6F7" } });

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="kicker mb-3">QR code</p>
          <h1 className="text-5xl leading-[0.95] sm:text-6xl">Door poster</h1>
          <p className="mt-3 max-w-xl text-sm text-steel-300">
            Print this and put it up by the door. Members scan it with their phone camera to
            check in. It opens <span className="text-paper">{url}</span>.
          </p>
        </div>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[210mm] rounded-md bg-paper px-10 py-14 text-center text-ink print:max-w-none print:rounded-none print:px-0 print:py-0">
        <Image src="/images/logo.jpg" alt="Next Gen Fight Hub" width={96} height={96} className="mx-auto h-24 w-24 object-contain" />
        <h2 className="mt-8 font-display text-7xl uppercase leading-[0.9] tracking-tight">Scan to check in</h2>
        <p className="mt-4 text-lg text-steel-500">Point your phone camera here. First time? Pop in your number once.</p>
        <div className="mx-auto mt-10 w-full max-w-[120mm]" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-10 font-display text-2xl uppercase tracking-tight">{site.tagline}</p>
      </article>
    </>
  );
}
