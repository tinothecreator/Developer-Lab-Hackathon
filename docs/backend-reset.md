# Supabase demo setup and reset

This is a disposable, unauthenticated hackathon demo. The NGO selector is presentation only; anyone with the public demo URL can read demo data, contribute simulated funds, upload a proof image for an awaiting order, and confirm delivery. Do not use real people, sensitive photos, or production data.

## Local Supabase reset

Install and start the Supabase CLI/local stack, then run this from the repository root:

```powershell
npx supabase start
npx supabase db reset
```

`db reset` applies `supabase/migrations/` and reruns the idempotent seed script, restoring the showcase basket to R400 / R550 with no order. The seed uses `TRUNCATE`; use it only against the disposable demo database.

## Hosted Supabase setup

In the Supabase SQL Editor for the disposable demo project:

1. Paste and run the complete `supabase/migrations/20261117000100_charity_eats_demo.sql`.
2. Paste and run the complete `supabase/seed.sql`.
3. Confirm `baskets` contains `00000000-0000-4000-8000-000000000301` with `funded_cents = 40000`, `target_cents = 55000`, and `status = funding`; confirm `orders` is empty.

To reset the hosted demo later, rerun `supabase/seed.sql` in the SQL Editor. It deletes and reseeds all demo tables.

The migration uses a separate `confirm_delivery` security-definer function for the narrow `awaiting_delivery` → `delivered` transition. Anon has no direct insert/update permission on baskets, contributions, or orders. The `contribute_to_basket` RPC locks the basket row, checks a replay key before basket status, and creates the single order at exact full funding.

## App configuration

Set these public values in `.env.local` for local work and in Vercel Environment Variables for deployment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only the Supabase URL and anon key are used by the app. No service-role key is required or supported.
