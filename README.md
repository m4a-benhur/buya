# Buya
Simple stamp-card loyalty for small businesses. Demo MVP (FreshCut Barbershop, Cape Town).

## Setup
1. `cp .env.example .env.local` and fill in your Supabase URL + anon key.
2. In Supabase: SQL Editor → run `supabase/migrations/0001_init.sql`.
3. Supabase → Authentication → Providers → Email → turn **off** "Confirm email" (smooth demo sign-up).
4. `npm install && npm run dev`, open http://localhost:3000
