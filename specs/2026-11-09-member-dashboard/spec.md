# Spec: Members dashboard for Hayden

## Meta

- **Type:** Private, read-only admin area inside the existing marketing site, plus a
  details step on the public site before Stripe checkout
- **Repo:** `Helping Hayden/Next Gen Gym/` (this repo). New route group `app/(admin)/`.
- **Status:** built 2026-11-09 (Decisions resolved, see below)
- **Created:** 2026-11-09
- **Depends on:** live Stripe Payment Links (commit `8796e00`)

## Overview

Hayden wants to see who has bought a membership, which one, and enough about each person
to run the gym: how to contact them, whether they are still paying, and when they joined.

There is no database to "look into". Every membership is sold through a Stripe hosted
Payment Link, so **Stripe is the database**: it already holds the customer, the
subscription, the price they are on, every invoice and every failed payment. This spec
builds a small, private, Next Gen branded window onto that data. It reads Stripe live on
each page load and stores nothing of its own.

It is deliberately **read-only**. Refunds, cancellations, price changes and card updates
stay in the Stripe Dashboard (for Hayden) and the Stripe customer portal (for members).
Every member row links straight to the matching Stripe page for those jobs.

### Why not just use the Stripe Dashboard?

Hayden can already see all of this in the Stripe app today, and that is the zero-code
fallback if this spec is shelved. What it does badly for a gym owner:

- It speaks in Stripe terms (customers, subscriptions, prices) rather than "members" and
  "Gold".
- No single view of "everyone currently paying, by membership, with their phone number".
- Youth memberships: the payer is a parent, the member is a child; Stripe has no slot for
  that unless checkout collects it (see Payment Link changes).
- It is not branded and is busy on a phone.

The dashboard earns its place only if it is faster than opening Stripe. Keep it small.

## Decisions (resolved 2026-11-09)

1. **Amend two repo invariants, narrowly. Approved by Max.** `CLAUDE.md` invariants 1 and 2 forbid auth and
   any Stripe secret. This feature needs both. Proposed amendment, which the build applies
   to `CLAUDE.md` and `AGENTS.md`:
   - Invariant 1 gains: "except the `/admin` area, which is private, read-only, dynamic,
     and gated by a single shared-password session. No user accounts, no database."
   - Invariant 2 gains: "The app may hold one Stripe key (`STRIPE_SECRET_KEY`), used
     only by `lib/admin/stripe.ts`, which may only send GET requests. Still no Stripe
     SDK, no webhook, no checkout backend, no write calls."
   The public site stays static, including the new join step.
2. **Login method: one shared admin password. Approved by Max.** An emailed sign-in link
   was rejected because it makes Resend a dependency of getting in (invariant 3).
   Revisit if a second staff member needs their own access.
3. **Member details are collected on the website, not by Stripe. Approved by Max.** Before
   checkout, the buyer fills in their name and phone (and the child's name for youth
   memberships) on a Next Gen page. See "Collecting member details on the website".

## Skills

The implementing agent should load:

- **`ui-ux-pro-max`** for the dashboard layout, data table and mobile card patterns.
- **`dataviz`** before building the overview stat tiles and the by-membership bar.
- **`run`** to launch locally and screenshot every admin screen, desktop and phone width.
- **`security-review`** after Phase 2, because this is the first code in the repo that
  shows personal data.

## Requirements

What must be true when done:

1. `/admin/login` shows a branded password form. A correct password sets a session cookie
   and lands on `/admin`; a wrong one shows an ember error and waits about one second.
2. Every `/admin/*` route except login redirects to `/admin/login` without a valid
   session. The check happens on the server in the admin layout and again inside every
   data loader (no middleware: invariant 1 keeps the public site free of it).
3. **Overview** `/admin` shows: active members, monthly recurring revenue, new members this
   month, cancellations this month, members needing attention (payment failed), and active
   members by membership.
4. **Members** `/admin/members` lists every person who has ever held a membership, with
   name, email, phone, membership, status, member since, last payment and total paid.
   Search by name, email or phone. Filter by membership and status. Sort by name, member
   since or total paid. Defaults to "Active", sorted newest first.
5. **Member detail** `/admin/members/[customerId]` shows contact details, current
   membership and status, full membership history, every payment with a receipt link, the
   youth member name (if collected), and "Open in Stripe" links.
6. **Export:** a "Download CSV" button on Members exports exactly the filtered rows.
7. Membership names match the site: Stripe prices are mapped back to the `memberships`
   module in `lib/site/memberships.ts`, never retyped. An unrecognised price still shows,
   labelled with its Stripe product name and flagged "Not on website".
8. Branded in Next Gen CI (see Brand), mobile-first, usable one-handed on Hayden's phone.
12. **Join step:** every online membership's "Join now" opens `/join/[key]`, a static page
    that collects full name, email and mobile (plus member's name for Juniors and Cadets),
    then sends the buyer to that membership's Payment Link carrying those details. The
    dashboard shows them for every member who bought through it.
9. Nothing under `/admin` is indexed, cached or prerendered, and it never appears in the
   site nav, footer or sitemap.
10. The public site is unchanged: every existing page still builds as static, and
    `next build` still needs no env vars (admin config is validated lazily, like Resend).
11. `npm run typecheck && npm run build` pass, and every admin screen is visually verified.

## Architecture

### Shape

```
app/(admin)/admin/
  layout.tsx            admin shell (own header, no site nav/footer), session check
  login/page.tsx        password form (the one client component, for pending state)
  login/actions.ts      signIn / signOut server actions
  page.tsx              Overview
  members/page.tsx      Members list (search/filter/sort via URL search params)
  members/[id]/page.tsx Member detail
  members/export/route.ts  CSV download (GET, session-checked)
lib/admin/
  env.ts                lazy zod validation of the admin env vars (server-only)
  session.ts            sign/verify the session cookie (server-only)
  stripe.ts             typed fetch wrapper over the Stripe REST API (server-only)
  members.ts            turns Stripe objects into Member rows; all business rules here
  priceMap.ts           Stripe price id -> PaymentKey
components/admin/       StatTile, MembersTable, MemberCard, StatusBadge, FilterBar
```

The `(admin)` route group gets its own root layout so the public `SiteHeader` and
`SiteFooter` never render inside it, and the public layout never pays for admin code.

Every admin page exports `dynamic = "force-dynamic"` and sets `robots: { index: false }`
in metadata. `app/robots.ts` (create if absent) disallows `/admin`.

### Environment

| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | the existing restricted key from `.env.local` (`rk_live_...`) |
| `ADMIN_PASSWORD` | the shared password, at least 16 characters |
| `ADMIN_SESSION_SECRET` | 32+ random bytes, signs the session cookie |

Validated lazily on first admin request in `lib/admin/env.ts`. If unset, `/admin` renders a
plain "Admin is not configured" page instead of throwing, and the build is unaffected.

**Key: reuse the existing one (Max, 2026-11-09).** The restricted key already in
`.env.local`, used to create the Payment Links, is reused rather than minting a read-only
one. Checked 2026-11-09: it can read subscriptions, customers, invoices, charges, prices,
products, checkout sessions and payment links. It also has write access, so:

- `lib/admin/stripe.ts` exposes a single `stripeGet(path, params)`; there is no code path
  that sends POST or DELETE. A test asserts every call uses GET.
- The key now goes into Vercel (Production only, marked Sensitive). Update the
  `.env.local` comment that says it must never be added to Vercel.
- If it ever leaks, roll it in Stripe (Developers, API keys) and update Vercel. Swapping
  in a read-only key later needs no code change, only the env var.

### Stripe access (no SDK)

Invariant 2 forbids the Stripe SDK. `lib/admin/stripe.ts` calls `https://api.stripe.com/v1`
with `fetch`, a Bearer `STRIPE_SECRET_KEY`, `cache: "no-store"`, and parses each response
with zod so Stripe shape drift fails loudly in one place. It exposes only what the pages
need:

- `listSubscriptions()`: `GET /v1/subscriptions?status=all&limit=100&expand[]=data.customer`,
  auto-paginated with `starting_after`. One call graph serves Overview and Members.
- `listInvoices(customerId)`: for member detail and "last payment" / "total paid".
- `listCheckoutSessions()`: `GET /v1/checkout/sessions?status=complete&limit=100`,
  auto-paginated, joined to subscriptions on `session.subscription`. Its
  `client_reference_id` carries the details from the join step.

At the gym's scale (hundreds of members) this is a handful of requests per page load.
Wrap the per-request result in React `cache()` so one render never fetches twice. No
persistent cache: Hayden should see a payment the moment Stripe has it.

### Mapping prices to memberships

Payment Link URLs do not contain price ids, so add `lib/admin/priceMap.ts`:

```ts
export const priceToPaymentKey: Record<string, PaymentKey> = {
  // price_... ids copied from each Payment Link's line item in the Stripe Dashboard
};
```

`members.ts` resolves `price.id -> PaymentKey -> memberships.find(m => m.key === key)` for
the display name, group and stars. Unmapped prices fall back to the Stripe product name
(Requirement 7), so an old or manually created price never hides a paying member.

### The Member row

`members.ts` collapses one Stripe customer's subscriptions into one row:

```ts
type MemberStatus = "active" | "cancelling" | "payment_failed" | "cancelled";

type Member = {
  customerId: string;
  name: string;             // join-step name, else customer.name, else email
  email: string;            // customer.email (prefilled from the join step)
  phone: string | null;     // join-step phone, else customer.phone
  youthMemberName: string | null; // join-step member's name, youth tiers only
  detailsSource: "website" | "stripe"; // "stripe" = bought via a bare Payment Link
  membership: { key: PaymentKey | null; label: string; pricePerMonth: number };
  status: MemberStatus;
  memberSince: Date;        // earliest subscription start for this customer
  lastPaymentAt: Date | null;
  totalPaid: number;        // sum of paid invoices, GBP
  stripeUrl: string;        // https://dashboard.stripe.com/customers/<id>
};
```

Status rules, in this order:

- `payment_failed`: current subscription is `past_due` or `unpaid`.
- `cancelling`: `active` with `cancel_at_period_end` true (shows the end date).
- `active`: `active` or `trialing`.
- `cancelled`: no live subscription left. Kept in the list so Hayden can win them back.

If a customer has two live subscriptions (it happens: someone buys Silver, then Gold
without cancelling), show one row per live subscription and mark both "Duplicate", which
is a real thing Hayden needs to sort out in Stripe.

**Overview figures:** active members = rows with status active, cancelling or
payment_failed. MRR = sum of their monthly price, excluding payment_failed rows (members, but not revenue). New this month = subscriptions created
since the 1st (Europe/London). Cancellations this month = subscriptions with `canceled_at`
since the 1st. Needing attention = payment_failed count, linking to the filtered list.

### Session

Stateless, no database:

- `signIn` compares the submitted password to `ADMIN_PASSWORD` with
  `crypto.timingSafeEqual` on equal-length SHA-256 digests, sleeps ~1s on failure.
- On success sets cookie `ngfh_admin` = `<expiry>.<HMAC-SHA256(expiry, ADMIN_SESSION_SECRET)>`,
  `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/admin`, 12 hour expiry.
- `verifySession()` recomputes the HMAC and checks expiry. Rotating
  `ADMIN_SESSION_SECRET` signs everyone out.
- Sign out clears the cookie. A "Sign out" link sits in the admin header.

No in-memory rate limiter (serverless instances do not share memory, so it would give
false comfort). The 1s delay plus a 16+ character password is the protection; note it in
Notes as a known limit.

### Privacy (UK GDPR)

This is the first screen in the repo that shows personal data. Rules:

- Responses carry `Cache-Control: private, no-store`. No admin data in logs, ever
  (log Stripe error codes, never payloads).
- The CSV route re-checks the session and sets `Content-Disposition: attachment`.
- No member data is written anywhere by this app: no files, no KV, no analytics events.
- Hayden is already the controller of this data in Stripe; showing it back to him adds no
  new processing. The join step does collect new details, so the site gains a short
  `/privacy` page (Phase 1).

### Brand (Next Gen CI)

Same tokens, fonts and rules as the public site (CLAUDE.md invariant 5). Specifically:

- Ground is `ink` with `ink-soft` cards and `steel-600` hairlines: a dark dashboard,
  matching the night look of the brand. Text in `paper` and `steel-200`.
- Headings and stat numbers in Anton (`font-display`), uppercase. Labels as kickers
  (`tracking-kicker`, small caps size, `steel-300`). Body and table text in Inter.
- Header: the existing `Logo` lockup at small size, then "Members" in the kicker style.
- **Colour budget is still three.** Status badges do not introduce green, red or amber:
  - active: `paper` text on `steel-700`
  - cancelling: `steel-200` outline badge with the end date
  - payment failed: `ember` outline badge plus a small ember dot. The only ember on the
    table, so it is what the eye finds first.
  - cancelled: `steel-400` text, no badge fill
- Membership labels reuse `TierStars` for Bronze to Platinum, so the metallics stay
  inside that component.
- Ember also for: the active nav item, focus rings, the "needs attention" stat tile
  border, and the login error. Never a full button or a large fill.
- Overview by-membership chart: horizontal bars in `steel-300`, the featured tier from
  `memberships.ts` in `ember`. Plain counts on the bars, no legend.
- No em dashes in any admin copy either.

### Layout

- **Phone (base):** Overview as a two-column grid of stat tiles, then the by-membership
  bars. Members as a stack of `MemberCard`s (name, membership with stars, status badge,
  tap-to-call and tap-to-email). Filter bar collapses to a single "Filter" sheet.
- **Desktop (`lg:`):** Members becomes a sticky-header table with sortable columns. Detail
  page goes two-column: contact and membership left, payment history right.
- Search, filter and sort live in URL search params so a filtered view can be bookmarked
  and the CSV export reads the same params. Search is server-side over the fetched rows.

## Collecting member details on the website

### The flow

1. Memberships page: "Join now" on an online membership now links to `/join/[key]`
   (same tab) instead of straight to Stripe. The customer portal link is unchanged.
2. `/join/[key]` is a short, branded page: membership name, price, stars, then a form.
   - Full name (required, max 60 characters)
   - Email (required; prefilled into Stripe so they do not type it twice)
   - Mobile number (required, UK; normalised to `+44...`)
   - Juniors and Cadets only: "Member's name" (the child; required, max 60), and the
     name and phone labels change to "Parent or guardian".
   - One line under the button: "We use these to contact you about your membership." with
     a link to `/privacy` (new; the site has no privacy page yet).
3. Submit validates with zod in the browser, then sends the buyer to:
   `<paymentLink>?prefilled_email=<email>&client_reference_id=<packed details>`
4. Stripe checkout opens with the email filled in. When they pay, Stripe stores
   `client_reference_id` on the Checkout Session, which the dashboard reads with the
   read-only key.

### Why this shape

- **Stays static, needs no new secret.** The form is a client component on a prerendered
  page; nothing is posted to our server and nothing is stored by us. Invariants 1 and 2
  hold for the public site.
- **Only paying members are recorded.** Details live on the Stripe Checkout Session, so
  someone who fills the form and walks away leaves nothing behind.
- **Rejected:** creating Checkout Sessions on our server with the details as metadata.
  It is cleaner data but needs a Stripe key with write access and a checkout backend,
  which invariant 2 exists to prevent.
- **Rejected:** Stripe's own phone and custom-field collection on the Payment Links. It
  works with no code, but Max wants the details captured on Next Gen's own page.

### Packing the details

Payment Links only accept a few URL parameters. Name and phone have no slot of their own,
so they travel in `client_reference_id`, which allows up to 200 characters of letters,
digits, `-` and `_`. That is exactly the base64url alphabet.

`lib/site/joinDetails.ts` (shared by the join page and `lib/admin/members.ts`):

```ts
export type JoinDetails = { name: string; phone: string; memberName?: string };
export function packJoinDetails(d: JoinDetails): string;   // "1|name|phone|memberName" -> base64url
export function unpackJoinDetails(id: string | null): JoinDetails | null; // null if absent or malformed
```

- Fields are trimmed and `|` is stripped before packing. Version prefix `1` allows a
  format change later.
- The form refuses to submit if the packed value is over 200 characters (only possible
  with very long non-English names) and asks for a shorter name.
- `unpackJoinDetails` never throws: a hand-edited or garbled value falls back to Stripe's
  own customer name, and the member row shows `detailsSource: "stripe"`.

### Known trade-offs

- The details sit in the checkout URL, so they appear in the buyer's own browser history.
  Acceptable for a name and phone number; never extend this to anything sensitive
  (dates of birth, medical notes).
- Anyone using an old direct Payment Link (shared on WhatsApp, say) skips the join step.
  The dashboard still shows them, with Stripe's billing name and email, and flags
  "No phone" so Hayden can ask.
- A buyer could type someone else's details. No worse than any paper form.

## Out of scope

- Any write action (cancel, refund, pause, change tier, email members). Linked to Stripe.
- Attendance or check-in tracking. Stripe does not know who turned up.
- Casual £10 passes. They are sold at the gym, not online, so Stripe never sees them.
- Multiple staff logins, roles or audit trail.
- Emailing or messaging members from the dashboard.

## Execution Plan

### Phase 0: Setup
- Apply the approved invariant amendments to `CLAUDE.md` and `AGENTS.md`, and add the
  join step to invariant 1's description of the public site.
- Generate `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`; add them and the existing
  `STRIPE_SECRET_KEY` to Vercel (Production) and `.env.local`.

### Phase 1: Join step (public site)
- `lib/site/joinDetails.ts` with pack/unpack and round-trip checks (ASCII, accented
  names, `|` in input, over-length, garbage input).
- `app/join/[key]/page.tsx` (static, `generateStaticParams` over online memberships) and
  `components/site/JoinForm.tsx` (client). Point `MembershipCard`'s "Join now" at it.
- Add a short `/privacy` page (footer link only): who holds the data (Hayden, via
  Stripe), what is collected (name, email, phone, child's name), why, and how to ask for
  it to be deleted. Plain wording; Hayden signs it off before launch.

### Phase 2: Data layer
- `lib/admin/env.ts`, `stripe.ts` (fetch + zod + pagination), `priceMap.ts`, `members.ts`.
- Exercise `members.ts` against live test-mode data, or a fixture of real Stripe JSON
  shapes, covering each status rule and the duplicate case.

### Phase 3: Session
- `session.ts`, login page and actions, admin layout guard, sign out.
- Run `security-review` on the diff.

### Phase 4: Screens
- Overview, Members (cards + table, search/filter/sort), Member detail, CSV export.
- `robots.ts` disallow, metadata noindex, `force-dynamic`.

### Phase 5: Verify
- `npm run typecheck && npm run build`; confirm build output still shows the public pages
  as static.
- Launch with `run`; screenshot the join page (adult and youth), login, Overview,
  Members (filtered), detail, at 390px and 1440px. Confirm the colour budget by eye.
- Do one real test-mode purchase through the join step and check the details appear on
  the member's row.

## Acceptance Criteria

- [ ] "Join now" on each online membership opens `/join/[key]`; casual passes and the
      portal link are unchanged.
- [ ] The join form requires name, email and mobile (plus member's name for youth), and
      sends the buyer to the right Payment Link with email prefilled and details packed.
- [ ] A purchase through the join step shows the website name, phone and member's name
      in the dashboard; a bare Payment Link purchase shows Stripe's details and "No phone".
- [ ] `/admin` and every child route redirect to login without a session, including the
      CSV route.
- [ ] Correct password signs in; wrong password shows an ember error after a delay.
- [ ] Overview shows the six figures, and they reconcile with the Stripe Dashboard counts.
- [ ] Members lists every customer with a membership subscription, past or present, with
      the correct status for at least one active, cancelling, failed and cancelled case.
- [ ] Membership names come from `lib/site/memberships.ts`; an unmapped price shows with
      "Not on website".
- [ ] Search, filter, sort work and survive a reload; CSV contains exactly the visible rows.
- [ ] Member detail shows payments with receipt links and an "Open in Stripe" link.
- [ ] No colour outside `ink`/`paper`/`steel`/`ember` (plus `TierStars` metallics) in
      `/admin`.
- [ ] `/admin` is noindex, disallowed in robots, absent from nav, footer and sitemap.
- [ ] Public pages still prerender as static; `next build` passes with no env vars set.
- [ ] `npm run typecheck && npm run build` green; screens verified on phone and desktop.

## Completion Promise

When every acceptance criterion is checked and validation passes, output the exact string:
`NEXTGEN_MEMBER_DASHBOARD_SPEC_COMPLETE`

## Notes

- **Biggest design decision:** read Stripe live, store nothing. No webhook, no database,
  no sync job, so nothing can drift out of step with what Hayden sees in Stripe.
- **Known limits:** shared password with no rate limiting across serverless instances;
  acceptable for one user with a long password. Upgrade path is the emailed sign-in link
  or Vercel's own deployment protection on a separate admin deployment.
- **Scale:** live fetch is fine to roughly 2,000 subscriptions. Past that, add a short
  `unstable_cache` with a manual "Refresh" button rather than a database.
