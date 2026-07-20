---
review_verdict:
  structural: PASS
  source_tracing: PASS
  ambiguity: PASS
  reality_grounding: PASS
  test_derivability: PASS
  overall: PASS
reviewer: lead (single-context; team-spawn machinery unavailable, proportionate to scope)
date: 2026-07-20
spec: ../spec.md
---

# Review 001 — Next Gen Fight Hub website spec

## Method note

The `review-general-spec` team process (3 parallel agents via `teammate-spawn`/`TeamCreate`)
was not used: that tooling is unavailable in this environment and is disproportionate for a
7-page marketing-site spec. The four review dimensions (structural, source-tracing, ambiguity,
grounding/testability) were applied directly by the lead against spec.md + discovery.md.

## 1. Structural — PASS
All required sections present (Meta, Overview, Skills, Requirements, Architecture, Reference
Files, Execution Plan, Acceptance Criteria, Completion Promise, Notes). Execution plan has
ordered phases with dependencies (Phases 1–2 gate Phase 3); single-agent sequential mode is
appropriate. Unique completion promise present. No two-streams-one-file risk (solo build).
Chunk granularity reasonable (not too fine, not too coarse).

## 2. Source tracing (discovery → spec) — PASS
Every discovery item is carried into the spec: problem/funnel, £10 hero CTA, 7 pages, full
pricing incl. TRB £85 and the resolved "no kids pricing", authoritative timetable, 6 coaches +
IG handles, socials/address, domain+hosting (GoDaddy/Cloudflare/auto-renew/cutover), IG-no-scrape
constraint, no-em-dash rule, subtle Pad Guy link, Resend contact form, media-without-Mux,
separate Stripe account, customer portal. Open questions carried as resolved (1,2) or as
tracked assumptions/action items (3–8). No coverage gaps.

## 3. Ambiguity — PASS (3 minor items resolved inline)
Timetable 24h conversion verified against the flyer cell-for-cell (incl. Fri Open Gym→Boxing,
Sun MT→Open Gym, Sat S&C + Boxing). Three low-severity clarity gaps were found and fixed in
the spec rather than left open:
- **Env module** said "Resend-only" but Phase 6 uses `NEXT_PUBLIC_SITE_URL`. Clarified: client
  = NEXT_PUBLIC_SITE_URL; server = RESEND_API_KEY/EMAIL_FROM/CONTACT_TO_EMAIL. (C0.2)
- **Map embed source** unspecified. Clarified: Google Maps place embed of the SS14 3DU address,
  no API key. (Architecture → config.ts)
- **Contact form vs missing Resend key** at build time. Clarified: sends no-op until Phase 6
  key exists (like Pad Guy); build verifies wiring/validation/fallback, not live delivery. (C3.1)

## 4. Reality grounding + test derivability — PASS
I/O contracts are concrete (payment-link URLs, form → safeSendEmail, timetable data → grid).
Requirements are testable and each maps to ≥1 acceptance criterion and ≥1 execution chunk. The
one process-style AC ("visually verified via screenshots") is appropriate for a visual product
and is backed by the `run`/`verify` skills. Known risks (membership terms, coach photos, ffmpeg
presence, hero copy sign-off) are logged fire-once in Notes, not left as silent gaps.

## Verdict: PASS — ready for implementation handoff.
No blocking issues. The three minor clarity gaps were resolved in spec.md during this review.
