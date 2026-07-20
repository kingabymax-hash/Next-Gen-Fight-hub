# Discovery: Next Gen Fight Hub website

## Problem statement

Next Gen Fight Hub is a Muay Thai / Boxing / MMA gym in Basildon, Essex, founded and
run by Hayden (also head coach, and the person behind the separate The Pad Guy
Programme). A previous developer built a site on the gym's domain; Hayden was unhappy
with it and wants a replacement.

The site's job is simple and commercial: take someone who found the gym (Instagram,
word of mouth, walking past) and move them one step down the funnel, to either **pay
£10 to try a class** or **buy a monthly membership**. It also has to answer the
question every visitor (prospect or existing member) actually arrives with: **"when are
the classes?"**

Success = more trial walk-ins and more memberships, and members no longer DMing to ask
what time Wednesday MMA is.

## Solution overview

A small, fast, **marketing** website. Critically, this is NOT a rebuild of The Pad Guy
in miniature: there are no user accounts, no gated content, no video paywall. The only
"app" behaviour is taking payments, and that is handed entirely to Stripe's hosted
checkout. Everything else is static content that loads fast and looks sharp.

Brand: **black / white / grey**, minimalist, modern, clean. Tagline **"Train. Hard.
Fight. Evolve."** with the sub-line **"Fitness. Technique. Community."** Logo is the
crossed-boxing-gloves circle badge + circuit-textured wordmark.

### Sitemap (7 routes; each has exactly one job)

```
Home         hook + hero CTA "Try a class for £10" (primary),
             "Become a member" (secondary). Taste of timetable, coaches, media.
Timetable    the full weekly grid (authoritative flyer below). What most people came for.
Memberships  the 4 tiers + £10 drop-in/day pass; each button → Stripe checkout.
Coaches      the 6 coaches: name, discipline, one line, Instagram link.
Media        photos + drone footage. Proof of the room and the energy.
About Us     the gym's story (Hayden + NextGen), the Train/Hard/Fight/Evolve ethos.
Contact      address, embedded map, hours, socials, + a message form (Resend).
```

### Primary funnel (why the hero leads with £10, not membership)

```
   Instagram / word of mouth / walking past
                    │
                    ▼
        "Is this place for me?"      ← Media, Coaches, room
                    │
                    ▼
        "Does it fit my week?"       ← TIMETABLE
                    │
                    ▼
        "Let me try it once" £10     ← low-friction front door (hero CTA)
                    │
                    ▼
        "I'm in" £35–£100/mo         ← membership (strong secondary)
```

There is **no free trial**. The lowest-friction real offer is the **£10 single class /
£10 day pass**, so that becomes the hero CTA. Asking a stranger for £10 converts far
better than asking for £100/month, and it puts them in the building where Hayden can
sell them properly.

## Pricing (confirmed by Hayden, locked)

| Tier | Price | What you get |
|------|-------|--------------|
| Bronze | £35/mo | Facilities + open gym |
| Silver | £50/mo | Facilities + 1 class/week |
| Muay Thai only | £80/mo | 3 Muay Thai classes/week + open gym (discipline-specific, parallels TRB Boxing) |
| TRB Boxing | £85/mo | 4x boxing/week (Mon 8–9, Wed 7:30–8:30, Fri 7:30–9, Sat 12–1) — shown on site |
| Gold | £90/mo | Facilities + 5 classes/week |
| Platinum | £100/mo | Facilities + **unlimited** classes (all disciplines, incl. boxing & MMA) |
| Drop-in | £10 | Single class, any discipline |
| Day pass | £10 | Facilities for the day |

**No joining fee.** Minimum term assumed none unless Hayden says otherwise. The model has two
shapes: general tiers (Bronze/Silver/Gold/Platinum) and discipline-specific memberships
(Muay Thai £80, Boxing £85), which sit deliberately alongside each other.

Notes:
- The Gold/Platinum overlap (£90 for 5 vs £100 for unlimited) was raised and Hayden is
  keeping it deliberately: the 5-class cap bites by mid-week, and £10 drop-ins are the
  intended overflow above Gold.
- **Platinum includes boxing and MMA**, i.e. it includes the Top Rope Boxing sessions
  and the Wednesday MMA class.
- **Top Rope Boxing (£85/mo, 4x boxing/week)** is a partner programme running *inside*
  the gym (all four "Adult Boxing" slots on the timetable are TRB's). The £85 is paid to
  Next Gen, and Hayden pays TRB. Whether the £85 boxing membership is shown on the
  NextGen site (it overlaps/contradicts the tiers) is an OPEN QUESTION below.

## Timetable (authoritative — the latest silver-on-black flyer)

The earlier "Mondays at Next Gen" red graphic is STALE; ignore it. Current grid:

```
MON  5–6 Juniors MT · 6–7 Cadets MT · 7–8 Adult MT · 8–9 Adult Boxing (TRB)
TUE  5–6 Juniors MT · 6–7 Cadets MT · 7–8 Adult Advanced MT · 8–9 Adult Beginner MT
WED  6–7 MMA (all levels, w/ Jacob Gifford) · 7:30–8:30 Adult Boxing (TRB)
THU  5–6 Juniors MT · 6–7 Cadets MT · 7–8 Adult Advanced MT · 8–9 Adult Beginner MT
FRI  5–7:30 Open Gym · 7:30–9 Adult Boxing (TRB)
SAT  10–11 Strength & Conditioning · 12–1 Adult Boxing (TRB)
SUN  10–11:30 Adult Muay Thai (all levels) · 11:30–5 Open Gym
```

Getting this right matters: a wrong timetable sends people to a locked door. The site
timetable should be easy for Hayden to update when classes change (data-driven, not a
baked-in image).

## Coaches

| Coach | Discipline | Instagram |
|-------|-----------|-----------|
| Hayden | All-round: Muay Thai, Boxing, K1, MMA (head coach) | @thepadguy |
| LPF Striking | K1 striking (a brand/team, not a person) | @lpfstriking_ |
| Jamie Biggs | Muay Thai | @jamiebiggsmt |
| Evan Jays | Muay Thai | @evan_jays |
| Top Rope Boxing | Boxing (a partner team) | @toprope.boxing |
| Jacob Gifford | MMA specialist | @jaccob_gifford |

Gym socials (footer + Contact): Instagram / TikTok / Facebook all **@nextgenfighthub**.
Address: **Unit 5 Bowlers Croft, Basildon, Essex, SS14 3DU**.

## Key decisions (with rationale)

1. **Marketing site, not an app.** No accounts, no Supabase, no Mux. The only dynamic
   behaviour is payment, delegated to Stripe hosted checkout. This is the single biggest
   scope decision and it keeps the build small and cheap to run.
2. **Hero CTA = "Try a class for £10", membership secondary.** Matches the real funnel;
   there is no free trial, so the £10 drop-in is the front door.
3. **Separate Next Gen Stripe account** (not the Pad Guy one). Different business,
   different money (Hayden pays TRB out of it). Tiers = recurring subscriptions; £10
   drop-in/day pass = one-off payments. Members self-manage/cancel via Stripe's built-in
   **customer portal**, so we still build zero account system.
4. **Same stack family as The Pad Guy** (Next.js App Router + Tailwind + Vercel) for
   familiarity and low run cost, but a fraction of the complexity.
5. **Data-driven timetable** so Hayden can update class times without a redeploy fight.
6. **Subtle cross-link to The Pad Guy Programme** (e.g. footer or Hayden's coach card),
   not a prominent banner. The two are different businesses bridged by one person.
7. **Contact via details + embedded map + a message form** (reuse the Pad Guy Resend
   `safeSendEmail` pattern).
8. **Reuse the same domain, do NOT buy a new one** (see Constraints / hosting).

## Constraints

- **Brand palette is black/white/grey**, minimalist. No colour accents unless Hayden
  asks (the flyers are strictly monochrome; the red "Mondays" graphic is off-brand/old).
- **Domain: `nextgenfighthub.com`, registered at GoDaddy** (Hayden has the login — full
  access confirmed). DNS nameservers currently delegated to **Cloudflare**
  (`bella`/`sterling.ns.cloudflare.com`), set up by the old developer. Because control
  lives at the **registrar (GoDaddy)**, we can repoint the nameservers off Cloudflare to
  our host without the old developer's cooperation and without transferring the domain.
  It is NOT a Cloudflare-registrar domain, so we are not locked to Cloudflare DNS. **No
  new domain needed.**
  - Domain **expires 2026-09-27** (~2 months out at time of discovery): confirm
    auto-renew is on.
  - Domain **created 2025-09-27**: minimal SEO history, so a clean rebuild costs nothing.
- **Instagram cannot be scraped** (blocks automation / needs auth). Any IG photos/videos
  Hayden wants used must be downloaded and handed over. We DO already have: the existing
  Pad Guy image library (gym, pad work, fight nights) and **~31GB of drone footage of the
  gym** at `../../Hayden Media Masters/DCIM/`.
- **No em dashes in user-facing copy** (project house style; hook-enforced in this repo
  family). Use commas/colons/parentheses.

## Context

- **Separate project, separate repo** from The Pad Guy. Lives at
  `Programming/Fun/Helping Hayden/Next Gen Gym/` (sibling of `The Pad Guy/`).
- **Patterns to reuse from The Pad Guy** (`../The Pad Guy/`): Tailwind design-token setup
  (`tailwind.config.ts`, editorial type system), the Resend `safeSendEmail` side-effect
  pattern (`lib/email/`), the Stripe client + checkout helper shape (`lib/billing/`),
  Vercel deploy + GoDaddy DNS cutover playbook (we did exactly this for thepadguy.com),
  and the `sips`-based image optimisation workflow (source masters → `public/images`).
- **Media handling:** unlike Pad Guy, no Mux. The Media page needs a lightweight approach
  to video (compressed self-hosted MP4 in `public/`, or an embed). See open questions.

## Reference files

Consulted during discovery:

**Codebase (sibling project, for reusable patterns):**
- `../The Pad Guy/tailwind.config.ts` — design tokens / palette approach
- `../The Pad Guy/lib/billing/` — Stripe client + checkout helpers
- `../The Pad Guy/lib/email/send.ts` — `safeSendEmail` (best-effort, never throws)
- `../The Pad Guy/app/about/page.tsx` + `../The Pad Guy/components/about/StoryTimeline.tsx`
  — editorial/scroll patterns, reference for polish level
- `../The Pad Guy/GO-LIVE.md` — Vercel + GoDaddy cutover runbook

**Source material provided by client (images, not in repo):**
- Latest timetable flyer (silver-on-black) — authoritative class grid
- Top Rope Boxing x Next Gen membership flyer — £85/4x boxing, revealed the TRB overlap
- MMA class flyer (Jacob Gifford, Wed 6–7pm)
- Gym logo + "Train. Hard. Fight. Evolve." branding

**Media assets on disk:**
- `../The Pad Guy/imagery-and-context/imagery/` and `../The Pad Guy/public/images/`
- `../../Hayden Media Masters/DCIM/` — ~31GB drone footage of the gym

## Open questions (resolve during spec/build)

1. **RESOLVED — TRB £85 boxing membership IS shown on the site.** It appears on the
   Memberships page alongside the tiers (£85/mo, 4x boxing/week: Mon 8–9, Wed 7:30–8:30,
   Fri 7:30–9, Sat 12–1). Present it clearly as the dedicated boxing option so it reads
   as a deliberate choice next to the tiers, not a contradiction. Money goes to NextGen.
2. **RESOLVED — no separate kids pricing.** Juniors/cadets are not priced separately;
   the standard tiers apply. Do not build a kids price tier.
3. **Coach photos + bio lines.** CONFIRMED at spec stage: Instagram cannot be read
   programmatically (login wall returns only the handle, no bio/posts). Bios ship as
   short, truthful, discipline-based placeholders (no invented accolades for named people);
   Hayden supplies one real line + a photo per coach to replace them. Hayden's own bio is
   written from real Pad Guy material.
4. **Media page video hosting.** Drone MP4s are large. Options: compress a few hero clips
   to web MP4 and self-host in `public/`; or embed (YouTube/Vimeo). No Mux in this stack.
5. **NextGen Stripe account** must be created by Hayden (live keys) before checkout works.
6. **Domain auto-renew** (expires 2026-09-27) — confirm on.
7. **RESOLVED — no joining fee.** Minimum term still assumed none unless Hayden says otherwise.
8. **Final hero copy / tone sign-off** with Hayden.

## Next steps

Point `/general-spec-builder` at this folder
(`Next Gen Gym/specs/2026-07-20-gym-website/`) to produce the build spec. The
spec-builder should resolve open questions 1–4 and 7 with the user, and treat 5–6 as
client action items tracked to launch. Build, then do the GoDaddy nameserver cutover off
Cloudflare (mirroring the thepadguy.com launch).
