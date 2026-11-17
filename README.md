# Charity Eats demo

Charity Eats is a fictional, mobile-first hackathon demo that pools grocery contributions for NGOs. Payment, verification, supplier fulfilment, notifications and delivery are simulated; no authentication or real integrations are used.

## Golden path

1. Open `/` and choose the featured Ubuntu Table.
2. Join its fixed grocery basket: two 25 kg maize meal bags and one 5 L cooking oil bottle. The target is R550; the seeded pool starts at R400.
3. Record R50 (demo), then R100 (demo), to complete the pool and create one order.
4. Switch to NGO view, select Ubuntu Table, upload a non-sensitive demo receipt photo and add a short note.
5. Return to the first contribution's tracking page to see the shared delivery evidence.

All organisations, registration numbers, catalogue data and supplier details are fictional. Receipt uploads must be JPEG, PNG or WebP and no larger than 5 MB.

## Local setup

Install dependencies and run the app:

```powershell
npm install
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`; the same public values are needed in Vercel Environment Variables. Do not configure a service-role key. Apply the schema and seed using the instructions in [docs/backend-reset.md](docs/backend-reset.md).

Run the configured checks:

```powershell
npm run lint
npm run typecheck
npm run build
```

See [docs/qa/acceptance.md](docs/qa/acceptance.md) and [docs/qa/demo-script.md](docs/qa/demo-script.md) for the manual rehearsal.
