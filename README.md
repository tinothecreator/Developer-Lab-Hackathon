# Surplus Food Matcher

A simple Next.js + Supabase MVP for matching surplus food with verified charities and food banks.

## Product goal

Donors list surplus food. Verified charities claim open items, then mark them collected when they pick them up. The app records the agreed price on collection and keeps the flow lightweight, secure, and auditable.

The MVP is deliberately small:

- one buyer role: verified charity/food bank
- one listing flow: list -> claim -> collect
- no payment gateway
- price stored as integer minor units only
- offline settlement on collection

## Core flow

1. Register
2. Admin verifies the organization
3. Browse open listings
4. Claim a listing
5. Mark it collected after pickup

A listing can be either:

- FREE: donation
- DISCOUNTED: low price set by the donor/seller

## The user experience

### Buyer side

- Sign up or log in
- See a pending-verification notice until an admin approves the organization
- View open listings only
- Sort listings by soonest expiry
- Open a listing and claim it
- Review claims and mark collected when pickup is complete

### Seller side

- Add listing items with donor name, item details, quantity, storage notes, pickup location, and expiry
- Set a price in minor units; `0` means free
- Keep status values in sync: `open`, `claimed`, `collected`, `expired`

## Data model

The app keeps to these core tables:

- `organizations(id, user_id, name, reg_number, contact_email, verified, created_at)`
- `listings(id, donor_name, item, quantity, storage_notes, expires_at, pickup_location, price_minor int default 0, currency text, status['open','claimed','collected','expired'], created_at)`
- `claims(id, listing_id, organization_id, agreed_price_minor, status, claimed_at, collected_at)`

Rules:

- `price_minor = 0` means free donation.
- `price_minor > 0` means discounted sale.
- The claiming organization never sets the price; the server copies it from the listing at claim time.
- Claims are atomic and must prevent duplicate claiming of the same open listing.

## Security and constraints

- Use Next.js App Router with TypeScript and Supabase.
- Enable Row Level Security on every table and default to deny.
- Charities can only read open listings and their own claims.
- Charities can claim only when `verified = true`.
- Only admins can set `verified`.
- Authenticate every route and server action.
- Validate input server-side with Zod and reject unknown fields.
- Store money as integers in minor units; never use floats.
- Keep secrets in environment variables only.
- Add security headers and require HTTPS.

## Tech stack

- Next.js App Router
- TypeScript
- Supabase Auth, Postgres, and RLS
- Tailwind CSS
- Vercel deployment

## Local setup

This repository currently contains the product specification and implementation target, not the app itself.

1. Create the Next.js app in the repository root.
2. Configure Supabase for Auth and Postgres.
3. Add the required environment variables in `.env.local`.
4. Run the app locally with `npm install` and `npm run dev`.
5. Verify the full flow end to end in a browser.

Example environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-key
```

Do not commit `.env` files or expose service-role credentials in client code.

## Definition of done

The MVP is complete when the full flow works end to end:

- registration and admin verification
- open listings board with pricing and expiry sorting
- claim flow that is safe against double-claims
- claim view and collection status update
- server-side validation and ownership checks
- price copied from the server, never from the client

## Notes

This MVP intentionally does not include a payment gateway, complex donor onboarding, or marketplace bidding. The goal is a secure, minimal product that proves the matching flow works reliably.
