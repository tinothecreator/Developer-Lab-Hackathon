# Copilot Instructions (token-lean, secure MVP)

Place at `.github/copilot-instructions.md`. Keep it short: it loads on every request.

## Project
Surplus-food matcher. MVP perspective: BUYER = verified charity/food bank that claims surplus.
A listing is FREE (donation) or DISCOUNTED (low price set by the donor/seller).
Single flow: register -> admin verifies -> browse open listings -> claim -> mark collected.
Payment is settled offline on collection (MVP records price only; no payment gateway).
Donor listings are seeded manually (out of scope).

## Stack (edit if different)
Next.js (App Router, TypeScript) + Supabase (Auth, Postgres, RLS). No other services.

## Output rules (save tokens)
- Reply with code only. No explanations, no summaries, no recap of the request.
- Edit minimally: show only changed lines/files, never reprint unchanged code.
- One small task per prompt. If the task is ambiguous, ask ONE short question.
- Reuse existing code and helpers before writing new ones.
- No new dependencies unless unavoidable; name the dependency in one line.
- No placeholder/boilerplate comments, no demo data beyond a small seed script.
- Skip tests except for claim logic, pricing, and auth/permission checks.
- Prefer built-in framework features over custom abstractions.

## Code rules
- TypeScript strict. Small functions, clear names, no dead code.
- Validate all input server-side with zod; reject unknown fields.
- Money: store as integer minor units (thebe/cents), never floats. Currency fixed to one code for MVP.
- Handle errors explicitly; return generic messages to clients, log details server-side.

## Security rules (non-negotiable)
- Secrets only in env vars. Never hardcode keys; never commit `.env`. Service-role key is server-only.
- Enable Row Level Security on every table. Default deny.
  - Charities read only open listings and their own claims.
  - Charities can claim only if `verified = true`.
  - Only admins can set `verified`.
- Price is set by the donor/seller, never by the buyer; server rejects client-supplied prices on claim.
- Claiming must be atomic (single SQL update `where status = 'open'`) to prevent double-claims.
- Authenticate on every route and server action; check role and ownership, not just login.
- Parameterised queries only. Never build SQL from strings.
- Escape/encode output; no `dangerouslySetInnerHTML`.
- Collect minimal personal data (org name, registration no., contact email). No data not needed.
- Rate-limit auth and claim endpoints.
- Add security headers; HTTPS only.

## Data model (keep to these)
- `organizations(id, user_id, name, reg_number, contact_email, verified, created_at)`
- `listings(id, donor_name, item, quantity, storage_notes, expires_at, pickup_location,
   price_minor int default 0, currency text, status['open','claimed','collected','expired'], created_at)`
   -- price_minor = 0 means free donation; > 0 means discounted price.
- `claims(id, listing_id, organization_id, agreed_price_minor, status, claimed_at, collected_at)`
   -- agreed_price_minor is copied server-side from the listing at claim time.

## Screens (buyer only)
1. Sign up / log in
2. Pending-verification notice
3. Listings board (open only; show Free or price; sort by soonest expiry)
4. Listing detail + Claim (shows price, "pay on collection" if > 0)
5. My claims + Mark collected

## Definition of done (per task)
Compiles, input validated, RLS/ownership enforced, price taken from server not client,
no secrets in code, happy path works end to end.

## Prompting tips (for humans)
- Paste only the relevant file or function, not the whole repo.
- Say "diff only" and name the file.
- Start new chats per task to avoid context bloat.
