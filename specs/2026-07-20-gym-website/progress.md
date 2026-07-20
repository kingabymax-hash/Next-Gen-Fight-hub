# Progress: Next Gen Fight Hub website

- **Date:** 2026-07-20
- **Origin:** Discovery session (client brief from Hayden via Max)
- **Status:** spec drafted → in review

## Status log
- 2026-07-20 — Discovery complete (discovery.md).
- 2026-07-20 — Spec-builder: Phase 1 intake, Phase 2 research (Pad Guy patterns), Phase 3 spec.md written. Now Phase 5 review.

## Work type / routing
- Frontend marketing site + one server action (contact email). NOT agent work → stayed in general-spec-builder.

## Key spec decisions
- Stripe **Payment Links** (no secret, no webhook, no payment backend). Only secret = RESEND_API_KEY (contact form).
- 7 static routes; data-driven timetable/memberships/coaches; mono black/white/grey.
- Resolved: kids = no separate pricing; TRB £85 boxing shown on site.

## Skills for implementation
- ui-ux-pro-max (design), run + verify (visual validation). Reference The Pad Guy patterns.

## Client action items (Phase 6 launch)
- NextGen Stripe account + Payment Links + portal; Resend key + domain; domain auto-renew (exp 2026-09-27); GoDaddy nameserver cutover off Cloudflare.

## Next
- /review-general-spec, then handoff to /general-implementation-builder.

## Implementation (2026-07-20)

Status: **v1 built, committed locally** (`0dcd0d6`), not yet deployed. Single-agent mode.
typecheck + build green; all 7 pages screenshot-verified desktop + mobile.

Built: scaffold (Next 15 + TS + Tailwind mono tokens, dark industrial theme, CLAUDE.md),
typed data (config/timetable/memberships/coaches/payments/media), shell (header w/ mobile
nav, footer w/ Pad Guy link), UI primitives, all 7 pages, Stripe Payment Link buttons with
"coming soon" placeholder state, Resend contact-form server action (safeSendEmail), curated
gym imagery optimised into public/images.

### Acceptance criteria: met, except one deferred (below).

### Drift Log / deferred (fire-once, logged):
1. **Feature video NOT shipped.** AC wanted >=1 self-hosted clip. ffmpeg present, but the
   sampled drone footage was not usable (close-up of hands, not training). Declined to ship
   weak footage on a client site. `featureVideo = null` (Media page degrades gracefully to
   the photo grid). ACTION: Hayden picks a good training clip; compress to /public/video/gym.mp4
   and set featureVideo. This is the single unmet AC, by deliberate quality choice.
2. **Contact map = verify on live.** Google Maps `output=embed` iframe renders in real
   browsers but not headless; confirm it displays on the live domain, else swap for a
   Share>Embed `pb=` string.

### Client action items to launch (Phase 6, unchanged):
NextGen Stripe account + Payment Links + portal (fill lib/site/payments.ts); Resend key +
verified sending domain (contact form no-ops until then); logo asset; coach photos + real
bio lines; Vercel project; GoDaddy nameserver cutover off Cloudflare; confirm domain
auto-renew (exp 2026-09-27); create GitHub remote + push.
