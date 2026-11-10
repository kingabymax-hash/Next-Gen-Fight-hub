# CLAUDE.md

Guidance for AI agents (and humans) working in this repo. Read this before editing.

## What this is

The marketing website for **Next Gen Fight Hub**, a Muay Thai / Boxing / MMA gym in
Basildon, Essex. Sister project to `../The Pad Guy` (the paid online membership platform);
they are separate businesses bridged by Hayden. Design/spec live in
`specs/2026-07-20-gym-website/`.

Stack: Next.js 15 App Router · Tailwind · Vercel. Static-first.

## Core invariants — do not violate

1. **Static-first marketing site.** No user accounts, no database, no middleware gate.
   Every public page is a static Server Component except the one contact-form action
   (the `/join/[key]` details step is static too: its form posts nothing to us). The one
   exception is `/admin`, Hayden's private, read-only members dashboard
   (`app/(admin)/`, spec `specs/2026-11-09-member-dashboard/`): dynamic, never indexed,
   gated by one shared password and a signed session cookie. Still no user accounts.
2. **Payments are Stripe hosted Payment Links only.** Plain external URLs in
   `lib/site/payments.ts`, reached through `/join/[key]`, which packs the buyer's details
   into `client_reference_id` (`lib/site/joinDetails.ts`). The app holds one Stripe key
   (`STRIPE_SECRET_KEY`), used only by `lib/admin/stripe.ts`, which may only send GET
   requests. No webhook, no Stripe SDK, no checkout backend, no write calls to Stripe.
3. **Email is a side-effect, never a dependency.** `lib/email/send.ts#safeSendEmail` never
   throws; the contact form degrades to a "DM us" fallback if it fails or is unconfigured.
4. **Content is data, not markup.** Timetable, memberships, coaches, photography and site
   config live in typed modules under `lib/site/`. Opening hours derive from the timetable so
   they can't disagree. Update data there, never hard-code it into a page. Photos are named
   exports in `lib/site/media.ts` (`gymImages`, `teamPhoto`, `galleryImages`) carrying their
   own alt text and real pixel dimensions; never write a bare `/images/...` path into a page.
5. **Near-monochrome UI, colour photography.** The ground is still black / white /
   cool-grey (`ink`, `paper`, `steel` in `tailwind.config.ts`). All photography ships in
   full colour: there is no `grayscale` class anywhere in the site, including the home
   hero, the Coaches portraits and the Contact map embed. Do not reintroduce it.

   **Exactly three sanctioned colours, and no fourth without Hayden:**
   - `ember` (warm orange) is the house accent, added because Hayden asked for subtle
     colour across the site. It is for *small* things only: kickers, active nav state,
     focus rings, hover states, form errors, the featured membership card, the head-coach
     badge, short rules. Never a large fill, never body copy, never a whole button.
   - `whatsapp` green is only ever the WhatsApp buttons (`variant="whatsapp"` in
     `components/ui/Button.tsx`), because the channel has to be recognisable.
   - The membership tier stars in `components/site/TierStars.tsx` are struck in bronze,
     silver, gold and platinum, because the tiers are named after those metals. Keep the
     metallics inside that component.
6. **No em dashes in user-facing copy.** Use commas, colons, or parentheses.
7. **Never fabricate coach credentials.** Bios are truthful and discipline-based; real
   detail comes from Hayden only. Clem, Slim, Keif and K (the Top Rope Boxing four), plus
   Jamie Biggs and Charlie McCormick, are on holding lines until Hayden sends their real
   bios and Instagram handles: replace the copy then, do not embellish it now.
8. **Boxing is Top Rope Boxing, a team of four.** They are individual coaches carrying
   `team: TOP_ROPE` in `lib/site/coaches.ts`, grouped under their own heading on the
   Coaches page. Timetable boxing slots use `coachTeam`, not `coachId`.

## Image pipeline

Raw drops live in the gitignored `imagery/` folder; only web-optimised copies under
`public/images/` are tracked. To add one:

```bash
ffmpeg -i "imagery/<file>" -vf "scale='if(gt(iw,ih),min(1800,iw),-2)':'if(gt(iw,ih),-2,min(1800,ih))'" -q:v 3 public/images/<dir>/<name>.jpg
ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 public/images/<dir>/<name>.jpg
```

Then add it to `lib/site/media.ts` with those exact dimensions. Coach portraits are
cropped to 4:5 first so the cards can centre-crop safely.

## Conventions

- Server-first; `"use client"` only where needed (mobile nav, contact form).
- `import "server-only"` on any module holding secrets.
- Mobile-first Tailwind: base size first, enhance with `sm:`/`lg:`.
- `@/*` path alias maps to repo root.

## Validate before declaring done

```bash
npm run typecheck && npm run build
```

`next build` needs NO env vars (the site URL defaults; Resend is validated lazily at send
time). Do not claim done without typecheck + build passing and the page visually verified.
