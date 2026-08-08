# CLAUDE.md

Guidance for AI agents (and humans) working in this repo. Read this before editing.

## What this is

The marketing website for **Next Gen Fight Hub**, a Muay Thai / Boxing / MMA gym in
Basildon, Essex. Sister project to `../The Pad Guy` (the paid online membership platform);
they are separate businesses bridged by Hayden. Design/spec live in
`specs/2026-07-20-gym-website/`.

Stack: Next.js 15 App Router · Tailwind · Vercel. Static-first.

## Core invariants — do not violate

1. **Static-first marketing site.** No user accounts, no database, no auth, no middleware
   gate. Every page is a static Server Component except the one contact-form action.
2. **Payments are Stripe hosted Payment Links only.** Plain external URLs in
   `lib/site/payments.ts`. The app holds NO Stripe secret and runs NO webhook. Do not add a
   Stripe SDK dependency or a checkout backend.
3. **Email is a side-effect, never a dependency.** `lib/email/send.ts#safeSendEmail` never
   throws; the contact form degrades to a "DM us" fallback if it fails or is unconfigured.
4. **Content is data, not markup.** Timetable, memberships, coaches, photography and site
   config live in typed modules under `lib/site/`. Opening hours derive from the timetable so
   they can't disagree. Update data there, never hard-code it into a page. Photos are named
   exports in `lib/site/media.ts` (`gymImages`, `teamPhoto`, `galleryImages`) carrying their
   own alt text and real pixel dimensions; never write a bare `/images/...` path into a page.
5. **Monochrome UI, colour photography.** All chrome/text/backgrounds are black / white /
   cool-grey only (tokens in `tailwind.config.ts`: `ink`, `paper`, `steel`); no colour UI
   accents. All photography ships in full colour: there is no `grayscale` class anywhere in
   the site, including the home hero, the Coaches portraits and the Contact map embed. Do not
   reintroduce it.

   **One sanctioned exception:** the membership tier stars in
   `components/site/TierStars.tsx` are struck in bronze, silver, gold and platinum, because
   the tiers are named after those metals and a grey pip repeated four times does not read
   as a ladder. Hayden asked for this deliberately. Keep the colour inside that component;
   do not let metallics spread to buttons, borders, tags or text anywhere else.
6. **No em dashes in user-facing copy.** Use commas, colons, or parentheses.
7. **Never fabricate coach credentials.** Bios are truthful and discipline-based; real
   detail comes from Hayden only. Clem, Slim, Keif and Krizi (the Top Rope Boxing four)
   are on holding lines until Hayden sends their real bios and Instagram handles: replace
   the copy then, do not embellish it now.
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
