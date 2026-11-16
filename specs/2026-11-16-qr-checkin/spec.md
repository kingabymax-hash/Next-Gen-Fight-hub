# Spec: QR check-in at the door

## Meta

- **Status:** built 2026-11-16, not live. Goes live when Hayden takes it up (quoted £300
  together with putting the members dashboard live).
- **Depends on:** the members dashboard (`specs/2026-11-09-member-dashboard/`).

## Why

Elise checks everyone in by hand. A QR code by the door lets members check
themselves in with their phone, so there's no queue, every visit gets logged, and Hayden
can see who is training, who has stopped coming, and which classes are busiest.

## Member flow (`/checkin`)

1. Scan the poster QR code. It opens `/checkin`.
2. **First time on this phone:** type the mobile number or email they joined with. An
   exact match against Stripe (via the join details) remembers this phone with a signed
   cookie (`lib/checkin/pass.ts`, 400 days, path `/checkin`).
3. **Every time after:** scan, and they are checked in at once. A parent with
   several juniors picks who is training.
4. Their membership is re-read live from Stripe on every scan (GET only).
   - Paid up, or cancelling but still in the paid period: black screen, big ember tick,
     name, membership, the class on now, and a ticking clock with a pulsing ring so
     that a screenshot looks obviously dead.
   - Payment failed or ended: white screen, black cross, "See the front desk".
5. A second scan within three hours is the same visit and isn't counted twice.

No fourth colour (invariant 5): it's a black screen for "let in" and a white one for "not
let in", and you can tell them apart from across the desk. If Hayden wants a green/red
screen, he has to say so first.

## Selfie on first check-in

The selfie stops people checking in with a fake number or a friend's. It is required
once per person training, before their first tick.

- It's taken live in the page with the front camera (`getUserMedia`), so it can't be
  picked from the camera roll. If the camera is blocked, it falls back to the phone's
  own camera through `capture="user"`. `/checkin` is the only route whose
  Permissions-Policy allows the camera.
- It's cropped and shrunk to a 480x600 JPEG in the browser, then stored in Redis under
  `ci:photo:<customer>_<hash of trainee name>`. A parent with two juniors has two photos.
- It's set once and never overwritten from the phone, so a friend can't swap in their
  own face. Only an owner can clear it ("Retake" on the member page), and then the
  member is asked again on their next scan.
- It's never shown on the member's phone, so a stranger who types a number never sees a
  face. Staff (owner or desk) see it through `/admin/photo/[key]`.
- The front desk shows the newest check-in large for three minutes, with their photo,
  so the receptionist can compare the face. Each row and each hand search result shows
  a thumbnail too.
- If the store is down or not set up, the selfie step is skipped and the member still
  gets in.
- The join page doesn't ask for a selfie. Joining happens before Stripe, when there
  is no member yet to attach the photo to. Every member meets the selfie at their
  first scan instead.
- The privacy page says so.

## Front desk (`/admin/front-desk`), for Elise

- Today's check-ins, newest first, refreshing every 15 seconds.
- Members who were turned away are marked in ember, with the reason.
- Tiles: checked in, see the desk, busiest class, by QR code.
- Per-class counts, worked out from the timetable (a scan up to 20 minutes before a class starts counts toward it).
- Check in by hand: search name, phone or email, then a "Check in" button. Logged as "By hand".
- Day before / Today navigation for past days.

## Staff logins

The same login page has two passwords, and the one typed decides what you see:

- `ADMIN_PASSWORD`: Hayden and Elise. Everything.
- `DESK_PASSWORD` (optional): the junior receptionists. They land on the front desk,
  get no nav, and see names, memberships and paid-up status only. They can't see
  revenue, payments, phone numbers, emails, member pages, the CSV export or the QR
  poster. Every owner page, loader and route calls `requireOwner()`, so a desk login is
  sent back to the front desk server side, not just hidden in the nav.

Changing `DESK_PASSWORD` locks the receptionists out at their next sign-in. Removing it
ends their sessions immediately.

## Elsewhere in the dashboard

- **Overview:** "Checked in today" and "Not trained lately" tiles, plus a list of the
  current members who haven't been in for 14+ days, with their phone numbers.
- **Member page:** Attendance (visits in the last 30 days, last in, recent visits).
- **QR code** (`/admin/qr`): an A4 door poster with a print button.

## Storage

Upstash Redis over REST (`lib/checkin/store.ts`), with no SDK. It reads
`KV_REST_API_URL`/`KV_REST_API_TOKEN` (the Vercel integration) or
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`. If neither is set, members still
get their tick but nothing is logged, and the front desk says so.

## Abuse limits

- Lookup is exact match only (a whole number or email), never partial.
- 8 lookups per IP every 10 minutes (Redis, or per-instance memory as a fallback).
- The public screen shows a first name and last initial only.
- The cookie is signed with `ADMIN_SESSION_SECRET` under its own label, so it can never pass as an admin session.
- Someone could scan at home. That only skews attendance, and the live clock on the screen stops a screenshot being shown at the door.

## Go-live checklist

1. Add Upstash Redis to the Vercel project (Storage, then Upstash). This sets the env vars.
2. Confirm `NEXT_PUBLIC_SITE_URL` is the live domain, so the poster QR code points there.
3. Print `/admin/qr` and put it up by the door.
4. Set `DESK_PASSWORD` in Vercel and give it to the receptionists.
5. Test with a real member on their phone, and with one whose payment has failed.
