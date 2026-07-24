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
4. **Content is data, not markup.** Timetable, memberships, coaches, and site config live in
   typed modules under `lib/site/`. Opening hours derive from the timetable so they can't
   disagree. Update data there, never hard-code it into a page.
5. **Monochrome UI, colour photography.** All chrome/text/backgrounds are black / white /
   cool-grey only (tokens in `tailwind.config.ts`: `ink`, `paper`, `steel`); no colour UI
   accents. Photography now ships in colour (remove the `grayscale` class), with these
   deliberate exceptions, which stay `grayscale`: the home hero, the Coaches page portraits
   (a uniform team wall), and the Contact map embed (avoids clashing with the dark theme).
6. **No em dashes in user-facing copy.** Use commas, colons, or parentheses.
7. **Never fabricate coach credentials.** Bios are truthful and discipline-based; real
   detail comes from Hayden only.

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
