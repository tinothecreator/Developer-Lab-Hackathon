# Charity Eats: Coding Standards

Rules for keeping the codebase clean, readable and usable during the 3-hour build with 5 people. This file works alongside `SPEC.md`. **If this file and `SPEC.md` disagree, `SPEC.md` wins.**

Stack: **Next.js App Router + TypeScript, Tailwind CSS, Supabase (Postgres + Storage), Vercel.** shadcn/ui is optional.

---

## 1. Golden rules

1. **Core loop first.** NGO posts need → donors pool money → NGO uploads proof → donors see it. Nothing else matters until this works end-to-end on Vercel.
2. **Understand before you commit.** Never commit AI-generated code you cannot explain in one sentence.
3. **Run it after every change.** Never stack multiple untested features.
4. **Money is integers.** Cents only. Never floats.
5. **Mocks are labelled.** Payment, supplier, notification and verification mocks must be visibly marked where the user acts.
6. **Keep it small.** Small functions, small components, small commits.

---

## 2. General design principles (DRY, KISS and friends)

Short definitions, then how each one applies to this codebase. When principles conflict, prefer the **simpler** option. Under a 3-hour deadline, readable beats clever every time.

### KISS: Keep It Simple
Choose the most boring solution that meets `SPEC.md`.

- Plain functions and `useState` before reducers, context, or state libraries.
- Server Components and direct service calls before building extra API layers.
- One `if` beats a clever one-liner. If you need a comment to decode it, rewrite it.
- If the AI hands you a 120-line solution, ask it for the simplest version that works.

### DRY: Don't Repeat Yourself
Every piece of knowledge has **one home**.

| Repeated thing | Single home |
|---|---|
| Status strings (`"funding"`, `"awaiting_delivery"`) | `lib/constants.ts` + `types/` |
| Money formatting | `formatZar()` in `lib/money.ts` |
| Validation rules (file size, note length, amount) | `lib/validation/` (Zod), shared by form and server |
| Supabase calls | `lib/services/` |
| Status label text ("Awaiting delivery") | One `getStatusLabel()` helper |
| Basket target calculation | One `calculateTargetCents()` function |
| Loading / empty / error UI | Shared `<LoadingState />`, `<EmptyState />`, `<ErrorState onRetry />` |

```ts
// Bad: same logic copy-pasted into three components
const remaining = basket.target_cents - basket.funded_cents;

// Good: one function, imported everywhere
export const getRemainingCents = (b: Pick<Basket, "targetCents" | "fundedCents">) =>
  b.targetCents - b.fundedCents;
```

**Rule of three:** copy once if you must; on the third copy, extract it. A wrong abstraction costs more than a little duplication, so don't merge two things that only *look* alike and will change for different reasons.

**Watch out:** AI tools love to regenerate the same helper in every file. Search for an existing one before accepting new code.

### YAGNI: You Aren't Gonna Need It
Build only what the spec and acceptance checks require.

- `SPEC.md` already lists exclusions: accounts, login, real payments, admin dashboard, maps, recurring giving, refunds. **Do not build them, stub them, or add hooks for them.**
- No generic "framework" code: no plugin systems, abstract base classes or config-driven everything.
- No speculative props, parameters, tables or columns "for later".
- Future integrations (PayFast, supplier ordering) are documented in the README, not coded.

### Separation of concerns
Each layer has one job:

| Layer | Job | Must not |
|---|---|---|
| `app/` pages | Fetch data, compose components | Contain SQL or pricing maths |
| `components/` | Render UI and handle interaction | Call Supabase directly |
| `lib/services/` | Talk to the DB and Storage | Render anything |
| `lib/validation/` | Define rules | Perform side effects |
| Postgres RPC / constraints | Guarantee data integrity | Depend on the UI being correct |

### Single responsibility
One function does one thing; one component renders one thing.

- Name check: if you need "and" to describe it (`validateAndSaveAndNotify`), split it.
- Size check: a function that doesn't fit on one screen is probably doing too much.
- Example: `ContributionForm` collects an amount; `submitContribution()` persists it; `formatZar()` formats it. Three jobs, three homes.

### Pure functions where possible
Keep logic that calculates things free of side effects, so it is easy to test and reason about.

- Basket totals, remaining balance, shortcut-enabled checks, status labels and cents parsing should all be pure functions of their inputs.
- Do I/O (network, DB, storage) at the edges, and pass plain data into the pure core.

### Make invalid states hard to represent
Let the type system and database do the policing.

- Use union types for statuses instead of free strings.
- Use `CHECK`, `UNIQUE` and foreign-key constraints so bad data cannot be saved even if the UI has a bug.
- Model "result or error" with the `Result<T>` type instead of `null` or thrown strings.

### Fail fast and use early returns
Handle bad input at the top, then the happy path reads straight down.

```ts
export async function submitContribution(input: ContributionInput): Promise<Result<Contribution>> {
  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) return fail("INVALID_AMOUNT", "Enter a valid amount in rand.");

  const basket = await getBasket(parsed.data.basketId);
  if (basket.status === "funded") return fail("BASKET_FULL", "This basket is already fully funded.");

  return callContributionRpc(parsed.data); // happy path last, unindented
}
```

### Explicit over implicit
No hidden behaviour.

- Prefer clear names and explicit props over magic defaults and implicit global state.
- Never silently "fix" a user's input (e.g. rounding an amount). Reject it and say why.
- Avoid boolean-flag props that change what a component does (`<Card compact primary dark />`). Use clear variants or separate components.

### Composition over duplication or inheritance
Build UI from small pieces: `Card`, `Badge`, `ProgressBar`, `Button` composed into `NeedCard` and `BasketSummary`. Prefer passing `children` and props to copying markup or creating class hierarchies.

### Principle of least surprise
Code and UI should do what their names and labels say.

- `getNgos()` only reads; it never mutates.
- A "Pay (demo)" button never charges anything real.
- Folders, file names and routes follow the structure in section 3, so teammates find things without asking.

### Separate "what" from "how" (light SOLID)
Don't over-engineer SOLID for a hackathon. Two parts of it matter here:

- **Single responsibility** (above).
- **Depend on abstractions at the boundary:** components depend on service functions (`submitContribution`), not on Supabase. That lets person 2 build donor screens against stubbed services while person 4 builds the real ones.

### Avoid premature optimisation
Correctness and clarity first. No caching layers, memoisation, or performance tricks unless you have measured a real problem. At this scale, the only "performance" work that matters is no unnecessary re-renders that break UX, and not loading huge images.

### Leave it better than you found it (Boy Scout rule)
If you touch a file, fix an unused import or unclear name nearby. Don't start unrelated refactors, though, and especially not after the feature freeze.

### Quick conflict guide

| If you're torn between... | Choose |
|---|---|
| DRY vs readable | Readable. Duplicate twice; extract on the third |
| Flexible vs simple | Simple (KISS + YAGNI) |
| Clever vs obvious | Obvious |
| Fast hack vs correct money/funding logic | Correct. This is the part judges will test |
| Polish vs working core loop | Working core loop |

---

## 3. Project structure

Layer-based, with feature folders inside `components/`. All five people use the same layout.

```
src/
  app/                          # Routes only: thin pages, no business logic
    page.tsx                    # /  NGO cards
    ngos/[id]/page.tsx
    basket/page.tsx
    checkout/page.tsx
    confirmation/[contributionId]/page.tsx
    donations/page.tsx
    donations/[contributionId]/page.tsx
    ngo/page.tsx
    ngo/orders/[orderId]/page.tsx
  components/
    ui/                         # Generic: Button, Card, Toast, Badge, Spinner
    donor/                      # NeedCard, BasketSummary, ContributionForm, ProgressBar
    ngo/                        # NeedForm, OrderList, ReceiptForm
    shell/                      # RoleToggle, NgoSelector, AppHeader
  lib/
    supabase/                   # client.ts (browser), server.ts (server)
    services/                   # All DB/Storage calls live here (see section 6)
    validation/                 # Zod schemas
    money.ts                    # formatZar(), parseRandToCents()
    constants.ts                # Statuses, limits, bucket name, shortcuts
  types/                        # Shared TypeScript types (mirror the DB)
supabase/
  migrations/                   # Schema + constraints + RPC functions
  seed.sql                      # Repeatable, idempotent seed
README.md
SPEC.md
CODING_STANDARDS.md
.env.example
```

**Rules**
- `app/` files orchestrate: fetch data, render components. No SQL, no pricing maths.
- Components never call Supabase directly. They call `lib/services/*`.
- Files over ~250 lines get split.
- One exported component per file, named the same as the file.

---

## 4. TypeScript

- `strict: true`. **No `any`.** Use `unknown` and narrow it, or define the type.
- Define shared types once in `types/` and import them. Do not redeclare shapes per person.
- Use union types for statuses, matching the DB check constraints exactly:

```ts
export type BasketStatus = "funding" | "funded";
export type ContributionStatus = "paid";
export type OrderStatus = "awaiting_delivery" | "delivered";
export type NeedStatus = "open" | "fulfilled";
```

- Export status values from `lib/constants.ts` so the UI and DB layer share one source.
- Prefer explicit return types on service functions.
- No unused variables or imports. ESLint should fail the build on them.

---

## 5. Naming and style

| Thing | Convention | Example |
|---|---|---|
| Components | `PascalCase` | `ContributionForm.tsx` |
| Functions / variables | `camelCase`, verb first for functions | `getNgoNeeds`, `submitContribution` |
| Booleans | Read like a question | `isSubmitting`, `hasFunding`, `canConfirmDelivery` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_PROOF_SIZE_BYTES` |
| DB columns | `snake_case` (as in SPEC) | `funded_cents`, `checkout_key` |
| Money variables | Suffix with `Cents` | `targetCents`, `amountCents` |
| Routes / folders | `kebab-case` or as in SPEC | `/donations/[contributionId]` |

**Tooling (set up in the first 15 minutes)**
- Prettier + ESLint (`next/core-web-vitals` + TypeScript rules), run on save.
- Scripts in `package.json`: `lint`, `typecheck` (`tsc --noEmit`), `build`.
- Run `npm run lint && npm run typecheck` before every push.

**Readability**
- Use early returns instead of deep nesting.
- Comment the **why**, not the what.
- No commented-out code. Delete it; Git remembers.
- No magic numbers or strings. Use `constants.ts`:

```ts
export const QUICK_CONTRIBUTION_CENTS = [5000, 10000] as const; // R50, R100
export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const RECEIPT_NOTE_MAX = 280;
export const PROOF_BUCKET = "delivery-proofs";
```

---

## 6. Data and service layer

All reads and writes go through `lib/services/`. One file per domain:

```
services/
  ngos.ts            getNgos(), getNgoById()
  needs.ts           getOpenNeeds(), createNeed()
  baskets.ts         getActiveBasket(), createBasket()
  contributions.ts   submitContribution(), getDonorContributions()
  orders.ts          getOrder(), confirmDelivery()
  storage.ts         uploadProof()
```

**Contract**
- Every service function returns a typed result, never raw Supabase responses:

```ts
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

- Error codes are stable strings the UI can switch on, e.g. `OVERFUNDED`, `INVALID_AMOUNT`, `DUPLICATE_NEED`, `UPLOAD_FAILED`, `BASKET_FULL`.
- UI shows `error.message` and never a raw database error.
- **Agree these function signatures in the first 15 minutes** (SPEC delivery plan) and stub them so everyone can work in parallel.

---

## 7. Money rules (critical)

- Store and calculate in **integer cents**. Convert to rand only for display.
- All money formatting goes through one helper:

```ts
// lib/money.ts
export function formatZar(cents: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}
```

- Never use `parseFloat` for money. Parse user input with a tested helper that rejects invalid values instead of rounding.
- Basket target = `sum(quantity_packs × unit_price_cents)`, using the **price snapshot** on `basket_items`, not the live catalogue price.
- **Reject** zero, negative, non-integer-cent, NaN and overfunding amounts. Never silently adjust the donor's amount.
- Disable the R50 / R100 / "Fund remaining" shortcut when it exceeds the remaining balance.

---

## 8. Contributions: atomic and idempotent (highest-risk code)

This is the part most likely to break during a live demo. Treat it carefully.

- **One Postgres function (RPC)** does everything in a single transaction:
  1. Lock the basket row (`SELECT ... FOR UPDATE`).
  2. Check the `checkout_key` has not been used (or return the existing result).
  3. Re-check remaining balance; reject if `amount > target - funded`.
  4. Insert the contribution (`status = 'paid'`).
  5. Update `funded_cents`.
  6. If `funded_cents = target_cents`: set basket `funded` and create **exactly one** order (`awaiting_delivery`).
- Do **not** do these as separate client-side calls.
- The client generates a unique `checkout_key` (`crypto.randomUUID()`) **once per checkout attempt** and reuses it on retry.
- Disable the Pay button while submitting.
- On a stale-balance rejection: refresh progress, show the new remaining amount, ask the donor to choose again. **No success screen for rejected payments.**
- DB constraints are the safety net, not the UI:

```sql
CHECK (funded_cents >= 0 AND funded_cents <= target_cents)
CHECK (amount_cents > 0)
UNIQUE (checkout_key)
UNIQUE (basket_id)  -- on orders
```

---

## 9. Validation

- **Zod schemas in `lib/validation/`**, shared by the form and the server-side mutation.
- Validate on the client for UX **and** on the server/DB for safety.

| Input | Rules |
|---|---|
| New need | Catalogue item required; positive integer quantity; note required; valid week-start; no duplicate open need for same NGO + item + week |
| Contribution | Whole cents; > 0; ≤ remaining balance |
| Receipt note | Trimmed; 1–280 characters |
| Proof photo | JPEG / PNG / WebP only; ≤ 5 MB; checked in the UI **and** in the upload path |

---

## 10. Frontend

**Every data-dependent screen handles four states:** loading, empty, error (with retry), success. Missing states are what make demos look unfinished.

**Mobile-first (360 px)**
- Design at 360 px first, then scale up.
- No horizontal overflow. Test it.
- Tap targets at least 44 × 44 px.

**Accessibility (from SPEC)**
- Every input has an associated `<label>`.
- Visible keyboard focus. Do not remove outlines.
- Status is shown with **text + colour**, never colour alone.
- Result messages use `role="status"` or `aria-live="polite"`.
- Images have descriptive `alt` text. Proof photos have an accessible larger view.
- Use semantic HTML (`button`, `nav`, `main`, headings in order).

**Simulation labels (must be visible at the point of action)**
- "Pay (demo)" button text and a notice on checkout.
- "Verification mocked" on every NGO card and profile.
- Supplier shown as fictional; delivery labelled free.
- Toasts for "notifications" labelled as demo.

**Status display mapping**

| State | Donor UI text |
|---|---|
| Basket `funding`, no order | Awaiting funding |
| Order `awaiting_delivery` | Awaiting delivery |
| Order `delivered` | Delivered |

**State and refresh**
- Keep state local; lift only when needed.
- Role toggle (Donor / NGO) and selected NGO persist across reloads (e.g. cookie or localStorage). It is a UI context, **not** auth.
- Refetch after mutations, on role switch, and when opening tracking screens.
- Preserve basket choices and form values after recoverable failures.
- Server Components for read-heavy pages; Client Components (`"use client"`) only where interaction needs them.

---

## 11. Supabase, secrets and security

- `.env.local` is **never committed**. Commit `.env.example` with variable names only:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server-only. Never prefix with NEXT_PUBLIC_
# SUPABASE_SERVICE_ROLE_KEY=
```

- The **service-role key is server-only.** If it ever appears in client code or a `NEXT_PUBLIC_` variable, that is a bug.
- Enable RLS and write explicit policies for the demo. The role toggle gives no isolation, so document that in the README.
- Storage bucket `delivery-proofs`: public only because the photos are non-sensitive fixtures; otherwise use signed URLs.
- Upload the photo **first**, then save path + note + `delivered_at` + status together. If either step fails, leave the order `awaiting_delivery`, keep the form values and show a retry message. Reuse the uploaded object on retry where possible.
- Never request or store payment credentials, even in the mock.
- Use only non-sensitive, fictional demo data. No real people, no real photos of children.

---

## 12. Database and seeds

- All schema changes live in `supabase/migrations/`. Do not make untracked changes in the dashboard.
- UUID primary keys, foreign keys, `created_at` / `updated_at` on mutable tables.
- `CHECK` constraints for statuses, positive quantities and positive prices.
- Unique constraints: `checkout_key`, one order per basket, one active basket per NGO, a need can only be in one active basket.
- **`seed.sql` must be idempotent** (safe to run repeatedly, e.g. `ON CONFLICT DO NOTHING` or truncate-and-reseed). Document a one-command reset for rehearsal.
- Seed must reproduce the showcase state exactly: Ubuntu Table basket **R400 / R550**, no order yet.
- Seed data stays fictional (`DEMO-NPO-001` etc.).

---

## 13. Git workflow (5 people, 3 hours)

**No pull requests.** Everyone commits directly to `main`. With five people and three hours, review overhead costs more than it saves, so the checklist in section 17 replaces PR review.

- `main` is always deployable. Never push code that fails lint, typecheck or build.
- **Pull before you push, every time:** `git pull --rebase origin main`, then `git push`. This avoids merge commits and noisy history.
- **Commit small and often** (every working change, at least every 15-20 minutes) so conflicts stay tiny.
- Messages say what changed:
  - Good: `add contribution RPC with row lock`
  - Bad: `stuff`, `fix`, `wip`
- **Stay in your lane.** Each person edits only their own area (see ownership table). This is what prevents conflicts without PRs.
- Shared files (`types/`, `lib/constants.ts`, `lib/money.ts`, `package.json`) are edited by one person at a time. Post a heads-up in the team chat before touching them, and push straight away afterwards.
- If you hit a conflict, resolve it carefully, run the app, and only then push. Never force-push to `main`.
- Never commit `node_modules`, `.next`, `.env*` (except `.env.example`), or secrets.
- Vercel deploys from `main`, so check the deployment after each push in your area.
- **Feature freeze at 165 min.** After that, demo-blocker fixes only.

**Ownership (from SPEC)**

| Person | Area |
|---|---|
| 1 | Shell, integration, deployment |
| 2 | Donor screens |
| 3 | NGO screens and proof of delivery |
| 4 | Schema, seeds, funding RPC, Storage |
| 5 | Checkout, confirmation, QA |

---

## 14. Working with AI coding tools

**Start every AI session by pasting:**
> Stack: Next.js App Router, TypeScript (strict), Tailwind, Supabase, Vercel. Follow `CODING_STANDARDS.md` and `SPEC.md`. Money is integer cents. Use `lib/services/` for all DB calls and Zod for validation. Do not add libraries or features that are not in SPEC. Apply DRY, KISS and YAGNI: reuse existing helpers before writing new ones, choose the simplest solution that works, and keep each function to one job.

**Do**
- Ask for **one thing at a time** (one component, one service function).
- Give it the relevant types and file paths.
- Ask it to review its own output for bugs, missing states and security issues.
- Paste the actual error message when debugging, not a description.

**Watch for these common AI mistakes**
- Hallucinated packages or Supabase / Next.js APIs (check the docs; App Router differs from the Pages Router).
- Floats for money, or `Math.round` silently altering a donor's amount.
- Client-side multi-step funding logic instead of the single atomic RPC.
- Service-role key used in client code.
- Missing loading / empty / error states.
- `any` types, unused imports, and leftover placeholder text.
- Scope creep: login, real payments, admin dashboards, maps (all **excluded** by SPEC).
- Duplicated helpers and copy-pasted logic across files (violates DRY). Search for an existing one first.
- Over-engineered abstractions: generic wrappers, extra layers, unnecessary patterns (violates KISS).
- Inconsistent styles between generations. Run Prettier and ESLint after every paste.

---

## 15. Testing and verification

No time for full coverage. Prioritise:

1. **Unit-test the pure logic:** `formatZar`, cents parsing, basket target calculation, contribution validation.
2. **Test the funding RPC** against the cases below (even manually via SQL or a script).
3. **Run the SPEC acceptance checks** against the deployed Vercel URL, and check the database, not just the success message.

**Funding edge cases to verify**
- [ ] R50 → R450 / R550, exactly one contribution row
- [ ] Same `checkout_key` twice → no duplicate, no double increase
- [ ] Zero, negative, invalid and overfunding amounts rejected
- [ ] Two simultaneous contributions cannot exceed R550
- [ ] R100 → R550 / R550, exactly one order, funding disabled
- [ ] Delivery impossible before full funding
- [ ] Bad file type / over 5 MB / failed upload leaves status unchanged

---

## 16. README requirements (judges read this first)

- What Charity Eats does and the problem it solves
- Note that the 17.8M food-insecure figure must be **verified against its original source** before being presented as a sourced statistic
- Tech stack
- Setup: install, env vars, migrations, seed (3–4 commands)
- Fixture reset command for rehearsal
- Three-minute demo walkthrough (follows the showcase fixture)
- What is mocked (payment, supplier, notifications, verification) and the real integrations that would replace each
- Known limitations: no auth, role toggle is not security, public bucket for demo only
- What's next: PayFast/Paystack, real supplier ordering, NGO verification, auth

---

## 17. Pre-push checklist

There is no PR review, so run through this yourself **before every push to `main`**. Treat it as your own reviewer.

```md
- [ ] Runs locally and the page/flow I changed works
- [ ] `npm run lint`, `npm run typecheck` and `npm run build` pass
- [ ] `git pull --rebase origin main` done and the app still runs
- [ ] No `any`, no unused code, no commented-out blocks
- [ ] No copy-pasted logic (DRY) and no over-engineering or unrequested features (KISS / YAGNI)
- [ ] Functions and components each do one thing
- [ ] Money is in cents and formatted via `formatZar`
- [ ] Inputs validated with Zod (and in the DB where relevant)
- [ ] Loading / empty / error / success states handled
- [ ] Works at 360 px with no horizontal scroll; keyboard usable; labels present
- [ ] Mock features are visibly labelled
- [ ] No secrets committed; `.env.example` updated if new variables added
- [ ] I can explain every line of AI-generated code I'm pushing
```

**Cross-check without PRs:** person 5 (QA) does a quick pass on the deployed app after each major merge to `main`, and any two people can pair on risky code such as the funding RPC.

---

## 18. Definition of done (demo-ready)

- [ ] All SPEC acceptance checks pass on the **deployed** Vercel app
- [ ] Seed resets cleanly to the R400 / R550 showcase state
- [ ] Full loop rehearsed end-to-end at least twice, on a phone
- [ ] README complete and the walkthrough matches the app
- [ ] Lint, typecheck and production build are clean
- [ ] Every mock is labelled; no real credentials or notifications anywhere
- [ ] Pitch rehearsed within three minutes

---

## Priority order if time runs short

1. Needs posted by NGOs and shown to donors
2. Atomic, idempotent pooled contribution
3. One order at full funding
4. Proof upload + receipt visible to all contributors
5. Loading / error states, mobile layout, simulation labels
6. README and clean seed reset
7. Visual polish, tests beyond the critical path

Per SPEC: **preserve NGO-posted needs, small pooled contributions and visible delivery evidence** above everything else.
