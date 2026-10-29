# Buya

Simple stamp-card loyalty for small businesses. Demo MVP using **FreshCut Barbershop** (Cape Town, prices in R).
Customers never install an app: they scan a QR code, join, and bookmark their card.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth) · qrcode.react

## Setup
1. Create a Supabase project. In **SQL Editor** run, in order: `supabase/migrations/0001_init.sql`, then `0002_app_functions.sql`, then `0003_weekly_visits.sql`.
2. Supabase → Authentication → Providers → Email → turn **off** "Confirm email" (demo only).
3. `cp .env.example .env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key works here).
4. `npm install && npm run dev` → http://localhost:3000 (Node 20.9+).

## Demo script
1. Sign up → create the programme (defaults: FreshCut Barbershop, 5 stamps, Free haircut).
2. **Overview → Load demo data** → analytics cards and the inactive list fill up.
3. Open the QR poster, scan it on a phone, join, and keep the card page open.
4. **Customers** → find your new customer → **Award stamp** (confirm). The phone's card updates when you return to it.
5. Award until the card is full → **Reward available!** shows on the phone → **Redeem reward** resets it.

## How it works
- **Scanning the QR only joins.** Stamps can only be awarded by the logged-in owner (`award_stamp` checks ownership).
- **Balance** is derived: stamps − redemptions × stamps required (`customer_stats` view). Every stamp and redemption is a timestamped row.
- **Can't redeem twice / over-stamp:** `redeem_reward` and `award_stamp` lock the customer row and re-check the balance in the database.
- **Row Level Security** limits owners to their own business. Customers have no table access; the public flow uses three narrow functions (`get_business_public`, `join_programme`, `get_card`).
- **Definitions:** *Returned within 30 days* = second stamp within 30 days of the first. *Inactive* = no stamp in 45+ days (or joined 45+ days ago and never stamped).
- The app **never sends messages**; inactive suggestions are display-only.

## Known limits (demo scope)
- A customer's card link is an unguessable id (treat it like a password). Re-joining with the same phone number returns the same card.
- No rate limiting or phone verification on the public join form.
- Out of scope: payments, SMS/WhatsApp, staff accounts, multiple programmes, points-per-rand, referrals.

## Deploy
Push to GitHub, import to Vercel, add the two env vars. QR codes use whatever domain the dashboard is opened on.

## Extra features
- **Retention funnel + weekly visits chart** on the Overview.
- **Scan-to-award:** each customer card shows a QR for staff. Scanning it opens that customer's page in the dashboard (login required) with an Award stamp button. Only the logged-in owner can award.
- **Languages:** the join page and card work in English, Afrikaans and isiXhosa (cookie-based switcher). Have a native speaker review the translations before real use.
- **Almost there** list and filters, **stamp history** per customer (every stamp and redemption with its timestamp).
- **Remind on WhatsApp:** opens the owner's own WhatsApp with a drafted message. Buya sends nothing.
- **Add to home screen:** each card has its own web app manifest, so a pinned card opens that customer's card.
