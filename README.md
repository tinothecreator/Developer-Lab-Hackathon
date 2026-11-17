# Charity Eats

A mobile-first hackathon demo connecting donors to fictional South African NGO grocery needs. Join Ubuntu Table’s fixed basket at **R400 / R550**, contribute **R50 (demo)** and then **R100 (demo)**, and create exactly one funded order. In NGO view, upload a non-sensitive grocery photo and note to confirm simulated receipt. Both donor contributions then show the same saved evidence.

Next.js App Router · strict TypeScript · Tailwind CSS · Supabase Postgres + Storage · Vercel.

## Run locally

1. Run `npm install`.
2. Privately populate `.env.local` with the two names in `.env.example`: your public Supabase URL and anon key. Never commit the file. No service-role key is required.
3. Apply the migration and seed using [backend setup](supabase/README.md).
4. Run `npm run dev` and open http://localhost:3000.

Before pushing, run `npm run lint`, `npm run typecheck`, and `npm run build`. Money tests: `npm exec tsx -- --test src/lib/money.test.ts`.

## Demo routes

- `/` → `/ngos/00000000-0000-4000-8000-000000000001` → `/basket` → `/checkout?basketId=00000000-0000-4000-8000-000000000301&amountCents=5000`
- Successful checkout opens `/confirmation/<contributionId>` and links to `/donations/<contributionId>`.
- Toggle NGO → `/ngo` → `/ngo/orders/<orderId>` to upload and confirm receipt.

Use the [three-minute script](docs/qa/demo-script.md) and [eight acceptance checks](docs/qa/m1-checklist.md). Deploy using the [Vercel click-by-click guide](docs/deployment.md). One-command developer reset: `psql -v ON_ERROR_STOP=1 -f supabase/seed.sql` with private PostgreSQL connection settings; alternatively rerun the seed in SQL Editor.

## Boundaries and owners

Owner 1: scaffold, shell, shared UI, integration and Vercel. Owner 2: donor entry/profile/basket/tracking. Owner 3: NGO workspace/receipt form. Owner 4: shared types, fixtures, services, SQL, Storage and reset. Owner 5: checkout/confirmation, QA and rehearsal. Exact paths are in [AGENTS.md](AGENTS.md); the frozen contract and scope are in [PLAN.md](PLAN.md).

Pages and components call `src/lib/services`, never Supabase directly. Shared domain types live only in `src/lib/types.ts`. Funding is atomic and idempotent through `contribute_to_basket`; receipt changes use the restricted `confirm_delivery` RPC. Only persisted success opens a success screen.

## What is mocked

Payments, notifications, supplier fulfilment, verification and delivery are visibly labelled **demo**. Names, registration identifiers, prices and grocery needs are fictional. No real payment credentials or notifications are used. There is no authentication: the persisted Donor/NGO selector changes the view, not permissions. Database reads are public and the proof bucket is public for non-sensitive images only. These policies are intended for a disposable demo, not production.

New needs, basket creation, contribution-history lists, need fulfilment, larger-photo views and concurrency stress testing remain Later. No real supplier, payment or verification integrations are implemented. M1 completion does not claim a Vercel deployment until its connection and URL are verified.
