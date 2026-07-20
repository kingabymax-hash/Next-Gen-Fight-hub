# Spec: Next Gen Fight Hub website

## Meta

- **Type:** Frontend marketing site (+ one server action for contact email)
- **Repo:** New — `Helping Hayden/Next Gen Gym/` (sibling of `The Pad Guy/`). Package name `nextgen-fight-hub`.
- **Status:** draft
- **Created:** 2026-07-20
- **Discovery:** `./discovery.md`

## Overview

A fast, static-first marketing website for Next Gen Fight Hub, a Muay Thai / Boxing / MMA
gym in Basildon, Essex. Its commercial job is to move a visitor one step down the funnel:
either pay £10 to try a class, or buy a monthly membership. It must also answer the
question every visitor arrives with, "when are the classes?", with an always-correct
timetable.

This is explicitly **not** a rebuild of The Pad Guy platform. There are no user accounts,
no gated content, no database, no video paywall. Payments are handed entirely to Stripe
**Payment Links** (plain external URLs), so the app holds no Stripe secret and runs no
webhook. The only server-side behaviour in the whole site is the contact form, which
reuses The Pad Guy's best-effort Resend email pattern. Everything else is static content
that loads fast and looks sharp.

Brand is strictly **black / white / grey**, minimalist and modern. Tagline "Train. Hard.
Fight. Evolve." with sub-line "Fitness. Technique. Community." Same stack family as The
Pad Guy (Next.js App Router + Tailwind + Vercel) for familiarity and low run cost, but a
fraction of the complexity.

## Skills

The implementing agent should load:

- **`ui-ux-pro-max`** — for the black/white/grey minimalist design system, layout,
  typography, and per-page composition. This is the primary design driver.
- **`run`** and **`verify`** — to launch the site and visually confirm each page (this is
  a visual product; screenshots are part of "done", as they were for The Pad Guy About page).
- Reference (not load): patterns in `../The Pad Guy/` — Tailwind tokens, `safeSendEmail`,
  `Button`/`buttonClasses`, env validation, `sips` image optimisation.

## Requirements

What must be true when done:

1. **Seven routes exist and render**, mobile-first responsive, in black/white/grey:
   Home `/`, Timetable `/timetable`, Memberships `/memberships`, Coaches `/coaches`,
   Media `/media`, About `/about`, Contact `/contact`.
2. **Home hero leads with the £10 trial** as the primary CTA and "Become a member" as a
   strong secondary. Both CTAs resolve to the correct Stripe Payment Link / Memberships page.
3. **Timetable is data-driven** (a typed module, not a baked image) and matches the
   authoritative flyer exactly (see Architecture → Timetable data).
4. **Memberships page shows all eight paid offerings** — Bronze £35, Silver £50, Muay Thai
   only £80, TRB Boxing £85, Gold £90, Platinum £100, £10 drop-in, and £10 day pass — each with
   a button that points to its Stripe Payment Link. Present the two discipline-specific
   memberships (Muay Thai £80, Boxing £85) as a deliberate pair alongside the general tiers.
   State "no joining fee". A Stripe customer-portal link is available for members to manage/cancel.
5. **Coaches page** lists the six coaches with name, discipline, one-line bio, and a link to
   the correct Instagram handle. Ships gracefully with a placeholder where a coach photo is
   not yet supplied.
6. **Media page** shows optimised gym photography and at least a few compressed, muted,
   self-hosted video clips (from the drone footage) without an external embed.
7. **Contact page** shows address, an embedded map, opening hours (derived from the
   timetable), the gym's socials, and a working message form that emails Hayden via Resend
   using the `safeSendEmail` pattern (never throws).
8. **Footer + Contact** carry the gym socials (@nextgenfighthub on Instagram / TikTok /
   Facebook) and a **subtle** cross-link to The Pad Guy Programme.
9. **No user-facing em dashes** anywhere in copy (house style). Use commas / colons / parentheses.
10. **`npm run typecheck && npm run build` pass**, and every page has been visually verified.

## Architecture

### Stack & shape

- Next.js 15 App Router + TypeScript + Tailwind CSS 3, deployed on Vercel. `@/*` → repo root.
- **Server-first**; `"use client"` only where needed (mobile nav toggle, contact form,
  any scroll effect). Mirror The Pad Guy conventions and `CLAUDE.md`.
- **Static-first.** Every page is a static Server Component except the contact form's
  submit path. No Supabase, no Mux, no database, no auth, no middleware gate.

### Payments — Stripe Payment Links (no backend)

```
Membership button ──(plain <a href>)──▶ Stripe-hosted Payment Link ──▶ Stripe checkout
Member "manage membership" ───────────▶ Stripe customer-portal login link
```

- The app holds **no Stripe secret key** and runs **no webhook**. Payment Links and the
  portal link are public URLs, kept in one typed config module `lib/site/payments.ts`.
- Values are **placeholders (`#`) until Hayden's separate NextGen Stripe account exists**
  and the products/links are created (client action item). Buttons render disabled-looking
  or route to a "coming soon" state when a link is still `#`. Same placeholder discipline
  as The Pad Guy's `STRIPE_PRICE_MAP`.
- Tiers = recurring subscription Payment Links; £10 drop-in / day pass = one-off Payment
  Links; TRB Boxing £85 = its own recurring link. All money is NextGen's.

### Contact form — the only server code

- A Server Action validates input (zod) and calls `safeSendEmail(CONTACT_TO_EMAIL, ...)`
  reusing The Pad Guy `lib/email/send.ts` pattern (Resend, best-effort, never throws).
- Secrets: `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL` (Hayden's inbox). These are
  the **only** environment secrets in the project. Validate via a small zod env module
  (copy the shape of `../The Pad Guy/lib/config/env.ts`, minus all the Supabase/Mux/Stripe keys).
- Graceful UX: on success show a confirmation; on failure show "couldn't send, please DM us"
  with the Instagram link (email must never hard-fail the page).

### Content data modules (typed, single source of truth)

- `lib/site/config.ts` — gym name, address (Unit 5 Bowlers Croft, Basildon, SS14 3DU), socials,
  Pad Guy link, and a Google Maps embed URL derived from that address (no API key needed for the
  standard place embed).
- `lib/site/timetable.ts` — the weekly grid as typed data (see below). Opening hours on the
  Contact page derive from this so they can never disagree.
- `lib/site/memberships.ts` — the eight offerings (name, price, cadence, what's included,
  `paymentLinkKey`, group: `tier` | `discipline` | `casual`). Bronze £35, Silver £50,
  Muay Thai only £80 (3 MT classes/wk + open gym), TRB Boxing £85 (4x boxing/wk), Gold £90,
  Platinum £100, drop-in £10, day pass £10. No joining fee.
- `lib/site/coaches.ts` — the six coaches (name, discipline, bio line, instagram, photo?).
  Use these exact placeholder bios (truthful, no invented accolades; Hayden replaces later):
  - Hayden — Muay Thai / Boxing / K1 / MMA — `@thepadguy` — "Head coach and founder. Fifteen
    years on the pads across Muay Thai, boxing, K1 and MMA, a competitive fighter, and the coach
    behind The Pad Guy Programme."
  - LPF Striking — K1 striking — `@lpfstriking_` — "K1 and striking. Sharp, technical sessions
    built on footwork, timing and combinations."
  - Jamie Biggs — Muay Thai — `@jamiebiggsmt` — "Muay Thai. Clean technique and ring craft,
    fundamentals through to fight prep."
  - Evan Jays — Muay Thai — `@evan_jays` — "Muay Thai. Technique and conditioning for every
    level, beginners welcome."
  - Top Rope Boxing — Boxing (partner team) — `@toprope.boxing` — "Boxing. Four proper boxing
    sessions a week, first jab to sparring."
  - Jacob Gifford — MMA — `@jaccob_gifford` — "MMA. Leads the Wednesday MMA class, all levels,
    striking through to ground work."
- `lib/site/payments.ts` — Stripe Payment Link + portal URLs (placeholders until live).

### Timetable data (authoritative — matches the silver-on-black flyer)

```
MON  17:00 Juniors MT · 18:00 Cadets MT · 19:00 Adult MT · 20:00 Adult Boxing (TRB)
TUE  17:00 Juniors MT · 18:00 Cadets MT · 19:00 Adult Advanced MT · 20:00 Adult Beginner MT
WED  18:00 MMA (all levels, Jacob Gifford) · 19:30 Adult Boxing (TRB)
THU  17:00 Juniors MT · 18:00 Cadets MT · 19:00 Adult Advanced MT · 20:00 Adult Beginner MT
FRI  17:00 Open Gym (to 19:30) · 19:30 Adult Boxing (to 21:00)
SAT  10:00 Strength & Conditioning · 12:00 Adult Boxing (TRB)
SUN  10:00 Adult Muay Thai all levels (to 11:30) · 11:30 Open Gym (to 17:00)
```

### Media handling (no Mux)

- Photos: optimise chosen stills with `sips` (long edge ~1600, q≈82) into `public/images/`,
  as done for The Pad Guy.
- Video: pick a handful of strong clips from `../../Hayden Media Masters/DCIM/` (drone) and
  the existing clip library, **compress with `ffmpeg`** to ~1080p H.264 MP4 (a few MB each,
  muted), self-hosted in `public/video/`. `<video muted loop playsinline preload="metadata">`.
  Verify `ffmpeg` is available; if not, note it as a build blocker for the media clips and
  ship the photo grid first. No YouTube/Vimeo embed (keeps it self-contained and on-brand).

### Brand / design constraints

- Palette: black / white / grey only (no red — the red "Mondays" flyer is off-brand/old).
  Define tokens in `tailwind.config.ts` mirroring The Pad Guy's approach (ink/paper/greys),
  minus `brand` red.
- Minimalist, modern, generous whitespace, strong condensed display type for headings.
- Logo: crossed-boxing-gloves circle badge + wordmark (Hayden to supply clean asset; use a
  text/SVG placeholder lockup until then).

## Reference Files

**The Pad Guy (sibling, reuse patterns — do not import across projects, copy/adapt):**
- `../The Pad Guy/tailwind.config.ts` — design-token structure (adapt to mono palette)
- `../The Pad Guy/app/globals.css` — base layer, `.kicker`, overflow handling
- `../The Pad Guy/components/ui/Button.tsx` — `buttonClasses` / `ButtonLink` API
- `../The Pad Guy/lib/email/send.ts` — `safeSendEmail(to, content)` best-effort pattern
- `../The Pad Guy/lib/config/env.ts` — zod env-validation shape (strip to Resend-only)
- `../The Pad Guy/app/about/page.tsx`, `../The Pad Guy/components/about/StoryTimeline.tsx`
  — editorial polish reference / scroll pattern
- `../The Pad Guy/GO-LIVE.md` — Vercel + GoDaddy DNS cutover runbook (for launch phase)
- `../The Pad Guy/CLAUDE.md` — conventions to mirror in the new repo's CLAUDE.md

**Assets:**
- `../The Pad Guy/imagery-and-context/imagery/`, `../The Pad Guy/public/images/` — stills
- `../../Hayden Media Masters/DCIM/` — ~31GB drone footage (compress a few clips)

**Discovery:** `./discovery.md`

## Execution Plan

Single-agent, sequential (a small solo-buildable site). Pages in Phase 3 are independent
and MAY be parallelised in team mode, but Phases 1–2 must land first (shared shell + data).

### Phase 0 — Scaffold
- **C0.1** New Next.js 15 + TS + Tailwind app in `Next Gen Gym/`; `@/*` alias; ESLint;
  `npm run typecheck`/`build` scripts; `.gitignore` (copy Pad Guy's, drop Supabase/Mux);
  `git init`; a repo `CLAUDE.md` mirroring Pad Guy conventions (server-first, mono palette,
  no em dashes, validate command).
- **C0.2** Mono design tokens in `tailwind.config.ts` + `globals.css` (ink/paper/greys, display
  + body fonts, `.kicker`). Minimal zod env module: client = `NEXT_PUBLIC_SITE_URL` (metadata/OG);
  server (lazy) = `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_TO_EMAIL`. These are the only env vars.

### Phase 1 — Shared shell + data
- **C1.1** `SiteHeader` (logo lockup + nav: Home, Timetable, Memberships, Coaches, Media,
  About, Contact; mobile menu toggle = the one client component here) and `SiteFooter`
  (address, socials @nextgenfighthub ×3, subtle Pad Guy link, copyright).
- **C1.2** Design primitives: `Button`/`ButtonLink` (adapt Pad Guy, mono variants),
  `Container`, `Section`, `PageHeader`.
- **C1.3** Content data modules: `lib/site/{config,timetable,memberships,coaches,payments}.ts`
  with the real data from Architecture. Payment link values = placeholders.

### Phase 2 — Pages
- **C2.1 Home** — hero (bold, image/video backdrop) with "Try a class for £10" primary +
  "Become a member" secondary; condensed teasers of timetable, memberships, coaches, media;
  location strip.
- **C2.2 Timetable** — full weekly grid from `timetable.ts`, readable on mobile (stacked
  per-day) and desktop (7-col). Tag TRB/MMA/levels clearly.
- **C2.3 Memberships** — the 7 offerings as cards; tiers grouped, drop-in/day-pass + TRB
  boxing presented as deliberate distinct options; each button → payment link; portal link +
  a short "what's included / no lock-in" note.
- **C2.4 Coaches** — 6 coach cards (name, discipline, bio line, IG link, photo-or-placeholder).
  Bios are the short truthful discipline-based placeholders in `coaches.ts` (Instagram is not
  machine-readable; do NOT invent accolades for named people). Hayden replaces with real lines later.
- **C2.5 Media** — responsive photo grid + a few self-hosted muted/looping clips.
- **C2.6 About** — the gym story + Train/Hard/Fight/Evolve ethos; subtle Pad Guy cross-link
  on Hayden's mention.
- **C2.7 Contact** — address, embedded map, hours (from timetable), socials, + message form UI.

### Phase 3 — Wire dynamic bits
- **C3.1** Contact form Server Action + `safeSendEmail` + zod validation + success/fail UX.
  Note: until the Phase 6 Resend key exists, sends return false (no-op) exactly like The Pad Guy;
  the build verifies the action wiring + validation + fallback UX, not live delivery.
- **C3.2** Payment link config wiring + graceful "coming soon" state for `#` placeholders.

### Phase 4 — Media assets
- **C4.1** Optimise stills (`sips`) into `public/images/`; select + compress a few drone/gym
  clips (`ffmpeg`) into `public/video/`; wire into Home hero + Media page.

### Phase 5 — Polish & verify
- **C5.1** Metadata/SEO per page, favicon, OpenGraph, responsive + a11y pass, no-em-dash sweep.
- **C5.2** `npm run typecheck && npm run build`; launch via `run`; screenshot every page
  desktop + mobile; fix visual issues.

### Phase 6 — Launch (deferred; client action items gate it)
- Create NextGen Stripe account + products + Payment Links + portal; fill `payments.ts`.
- Resend key + verified sending domain for the contact form.
- Vercel project; set `NEXT_PUBLIC_SITE_URL`; deploy.
- GoDaddy: repoint nameservers off Cloudflare to Vercel (mirror the thepadguy.com cutover);
  confirm domain auto-renew (expires 2026-09-27).

## Acceptance Criteria

- [ ] All 7 routes render, mobile + desktop, strictly black/white/grey.
- [ ] Home hero primary CTA = "Try a class for £10"; secondary = "Become a member".
- [ ] Timetable renders from `lib/site/timetable.ts` and matches the authoritative grid above
      cell-for-cell.
- [ ] Memberships shows Bronze £35 / Silver £50 / Muay Thai £80 / TRB Boxing £85 / Gold £90 /
      Platinum £100 + £10 drop-in + £10 day pass (8 offerings), each button targeting its
      payment-link key; "no joining fee" stated; portal link present.
- [ ] Placeholder payment links (`#`) render a graceful "coming soon" state, not a broken link.
- [ ] Coaches: 6 coaches, correct IG handles (`@thepadguy`, `@lpfstriking_`, `@jamiebiggsmt`,
      `@evan_jays`, `@toprope.boxing`, `@jaccob_gifford`), placeholder-safe photos.
- [ ] Media page shows optimised photos + ≥1 self-hosted muted looping clip (no external embed).
- [ ] Contact form submits via a Server Action and calls `safeSendEmail`; failure never throws
      and shows the DM fallback; address, map, hours, socials all present.
- [ ] Footer + Contact carry @nextgenfighthub ×3 and a subtle Pad Guy link.
- [ ] No em dashes / en dashes in any user-facing copy.
- [ ] `npm run typecheck && npm run build` green; every page visually verified via screenshots.

## Completion Promise

When every acceptance criterion is checked and validation passes, output the exact string:
`NEXTGEN_FIGHTHUB_SITE_SPEC_COMPLETE`

## Notes

- **Biggest design decision:** Payment Links (not Checkout Sessions) → zero payment backend,
  no Stripe secret, no webhook. Revisit only if Hayden later needs dynamic pricing or in-app
  membership management beyond Stripe's own portal.
- **Known risks / assumptions (fire-once, logged, proceed):**
  - Membership terms: **no joining fee** (confirmed). Minimum term assumed none unless stated.
  - Coach bios: Instagram is NOT machine-readable (login wall, confirmed at spec stage). Bios
    ship as short truthful discipline-based placeholders; never fabricate records/titles for
    named people. Hayden supplies one real line + a photo per coach to replace them.
  - Media video: assumes `ffmpeg` present to compress drone clips; if absent, ship photos first.
  - Hero copy / tone: drafted by the build; flag for Hayden sign-off at review.
- **Gold vs Platinum overlap is intentional** (client confirmed) — do not "fix" the pricing.
- **Client action items tracked to launch (Phase 6):** NextGen Stripe account + links; Resend
  key + domain; domain auto-renew; nameserver cutover off Cloudflare.
