import Link from "next/link";
import { site, addressOneLine } from "@/lib/site/config";
import { navLinks } from "@/components/site/nav";
import { InstagramIcon, TikTokIcon, FacebookIcon, WhatsAppIcon } from "@/components/ui/icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-paper/10 bg-ink">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand + address */}
          <div>
            <p className="font-brand text-xl uppercase leading-none tracking-tight text-paper">
              Next Gen <span className="text-steel-300">Fight Hub</span>
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-steel-400">
              {site.tagline}
            </p>
            <address className="mt-6 not-italic text-sm leading-relaxed text-steel-200">
              {site.address.line1}
              <br />
              {site.address.city}, {site.address.county}
              <br />
              {site.address.postcode}
            </address>
            <a
              href={site.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm text-steel-200 hover:text-paper"
            >
              <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
              WhatsApp {site.whatsapp.display}
            </a>
            <div className="mt-6 flex items-center gap-5 text-steel-300">
              <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={site.socials.tiktok} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <span className="text-xs uppercase tracking-[0.18em] text-steel-400">
                {site.socials.handle}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav aria-label="Footer">
            <p className="kicker mb-5">Explore</p>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-steel-200 hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Pad Guy cross-link (subtle) */}
          <div>
            <p className="kicker mb-5">Also from Hayden</p>
            <a
              href={site.padGuy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-xs text-sm text-steel-300 transition-colors hover:text-paper"
            >
              <span className="font-semibold text-steel-100">{site.padGuy.name}</span>
              <br />
              {site.padGuy.blurb}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs uppercase tracking-[0.18em] text-steel-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{site.name}</p>
          <p className="normal-case tracking-normal text-steel-500">{addressOneLine()}</p>
        </div>
      </div>
    </footer>
  );
}
