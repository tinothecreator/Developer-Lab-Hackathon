# Copilot prompts per milestone — paste your section only

Every owner: work on your own branch. Open a fresh Copilot chat, paste only your prompt below.
All prompts assume `.github/copilot-instructions.md` is already committed.

================================================================
## M1 — Foundation
================================================================
Follow .github/copilot-instructions.md. Code and file paths only, no prose.

Scaffold a Next.js app: TypeScript, App Router, Tailwind, src/ directory.
Add .gitignore including `.env*`.
Add .env.example listing: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
Create two Supabase clients in separate files:
- a browser client using the anon key,
- a server-only client using the service role key, with a comment that it must never be imported in a client component.
Do not hardcode any keys. Confirm with the command to run the build.

When done, tell me the two client file paths and the env var names so I can note them in HANDOFF.md.

================================================================
## M2 — Database + claim logic   (needs M1 merged)
================================================================
Follow .github/copilot-instructions.md. Output SQL only.

Write one Postgres migration for Supabase with these tables:
- organizations(id uuid pk default gen_random_uuid(), user_id uuid references auth.users unique, name text, reg_number text, contact_email text, verified bool default false, created_at timestamptz default now())
- profiles(user_id uuid references auth.users primary key, is_admin bool default false)
- listings(id uuid pk default gen_random_uuid(), donor_name text, item text, quantity int, storage_notes text, expires_at timestamptz, pickup_location text, price_minor int default 0, currency text default 'BWP', status text default 'open' check (status in ('open','claimed','collected','expired')), created_at timestamptz default now())
- claims(id uuid pk default gen_random_uuid(), listing_id uuid references listings, organization_id uuid references organizations, agreed_price_minor int, status text default 'active' check (status in ('active','collected')), claimed_at timestamptz default now(), collected_at timestamptz)

Enable RLS on all four, default deny. Policies:
- organizations: a user can select/insert/update only their own row (user_id = auth.uid()). The verified column must not be updatable by the owner.
- listings: authenticated users can select only rows where status='open'. No client insert or update.
- claims: a user can select only claims whose organization_id belongs to their organization. No client insert or update.
- profiles: a user selects only their own row.

Then write a security-definer function claim_listing(p_listing_id uuid):
- find the caller's organization via auth.uid(); raise exception if not found or not verified.
- update listings set status='claimed' where id=p_listing_id and status='open' returning the row.
- if no row updated, raise exception 'unavailable'.
- insert into claims with agreed_price_minor = the listing's price_minor; return the new claim id.
- grant execute to authenticated.

Finally write seed.sql: 1 admin profile, 1 verified organization, 4 listings (2 with price_minor=0, 2 with a small price_minor).

When done, give me the final table/column names and the claim_listing signature for HANDOFF.md.

================================================================
## M3 — Auth + verification   (needs M1, M2 merged)
================================================================
Follow .github/copilot-instructions.md. Code and file paths only, no prose.
Here are the Supabase client files and table names: [PASTE from HANDOFF.md].

Build:
- Email+password sign-up and login pages using Supabase Auth.
- On sign-up, a server action validated with zod creates the organization row (verified=false) with name, reg_number, contact_email. Reject unknown fields.
- Route protection: logged-out users are redirected to /login. Logged-in users whose organization is not verified see a /pending page instead of the app.
- An admin-only page /admin that lists organizations where verified=false, each with a Verify button. The Verify server action must check the caller is an admin (profiles.is_admin) and use the server-only client to set verified=true. Reject non-admins.

Test the verify server action rejects a non-admin caller.
When done, give me a helper's name/signature for "get current user + their organization + verified status" for HANDOFF.md.

================================================================
## M4 — Listings + claim UI   (needs M2, M3 merged)
================================================================
Follow .github/copilot-instructions.md. Code and file paths only, no prose.
Here is the current-user/org helper and the claim_listing signature: [PASTE from HANDOFF.md].

Build:
- /listings: list listings with status='open', sorted by expires_at ascending. Each card shows item, quantity, pickup_location, expires_at, and "Free" when price_minor=0, otherwise the price formatted from minor units with the currency.
- /listings/[id]: show the listing detail and a Claim button. Claim calls a server action wrapping the claim_listing function. When price_minor>0 show "Pay on collection". If claim_listing raises 'unavailable', show a friendly "already claimed" message and refresh the list. Only verified users can reach these pages (reuse M3's gating).

Test the claim path handles the 'unavailable' error.
When done: no handoff needed.

================================================================
## M5 — My claims + collection + ship   (needs M3, M4 merged)
================================================================
Follow .github/copilot-instructions.md. Code and file paths only, no prose.
Here is the current-user/org helper and the claims table columns: [PASTE from HANDOFF.md].

Build:
- /claims: list the current organization's claims, split into active and collected. Show the listing item and agreed_price_minor.
- A "Mark collected" button on each active claim. Its server action must verify the claim belongs to the caller's organization, then set claims.status='collected', collected_at=now(), and the linked listing status='collected'. Reject if the claim isn't theirs.
- Add HTTP security headers and force HTTPS in next.config.
- Write README.md in 15 lines or fewer: set env vars, run the migration, run the seed, start the app, how to make the first admin.

Test "Mark collected" rejects a claim the caller doesn't own.
This completes the flow end to end.
