# Charity Eats — instructions for coding agents

Charity Eats is a three-hour, five-person mobile-first hackathon demo connecting donors to fictional NGO grocery needs.  
Join Ubuntu Table's seeded basket at R400 / R550; its grocery contents are already fixed.  
Pay R50 (demo), then R100 (demo), reaching R550 and creating exactly one order.  
In NGO view, upload a non-sensitive photo and note and confirm simulated receipt.  
Return to donor tracking to see Delivered, the photo and note; payments, notifications, supplier fulfilment and verification are all mocked.

## Fixed stack

Use Next.js **App Router**, TypeScript, Tailwind CSS, Supabase **Postgres + Storage**, and Vercel. shadcn/ui is optional. Do not replace the framework, router, language, database, Storage provider, styling approach or deployment target. No authentication or real integrations in this demo.

## Scope and safety rules

- Read **PLAN.md and SPEC.md before starting**, plus README.md for owner responsibilities. User instructions override source-doc scope conflicts; PLAN.md records the narrowed hackathon scope and agreed contract.
- Work only on the assigned task. Respect **Demo path** / **Later** tags: never build **Later** items unless explicitly asked. This includes new basket creation, need posting, duplicate-need enforcement, need fulfilment, `/donations`, larger-photo view, concurrency stress testing and the full acceptance table.
- Money is **integer cents only**, including calculations and stored values; display as ZAR. Never silently round or reduce a chosen contribution.
- Keep contribution recording, total update and order creation in **one Postgres function**, `contribute_to_basket`, called via `supabase.rpc`. Preserve no-overfunding checks, idempotent checkout keys and exactly one order at full funding. Do not split these into client writes.
- Never put secrets in the repo. The only permitted `NEXT_PUBLIC_` configuration is the public Supabase URL and anon key. Never expose service-role credentials. Use explicit demo Postgres/Storage policies; the role toggle provides no authorisation.
- Every mocked feature must show a visible **“demo”** label at its point of use: “Pay (demo)”, “Notification (demo)”, “Supplier fulfilment simulated (demo)”, “Verification mocked (demo)”. Put “Delivery simulated (demo)” beside delivery status/actions. Never claim real verification, real payment or real delivery.
- Use fictional data and non-sensitive demo photos. Upload proof before saving delivered status; preserve form input on failure. Use `delivery-proofs` and the agreed validation/receipt contract in PLAN.md.

## Coding conventions

- TypeScript strict mode; shared domain types live only in `src/lib/types.ts`. Reuse them and coordinate contract changes with owner 4 and affected owners.
- Keep components small and focused; put route-specific UI with its owning feature rather than editing shared files unnecessarily.
- Build mobile-first at **360 px** with no horizontal overflow. Use accessible input labels, descriptive photo alt text, keyboard focus, text alongside status colours and accessible result messages.
- Handle loading, empty, validation-error and retry states where applicable; refresh persisted data after mutations, role changes and opening tracking. Do not show success before persistence succeeds.

## Collaboration and file ownership

Proposed boundaries become fixed at M0. Owner 1 creates the initial scaffold, then hands feature files to their owners. File paths are implementation targets, not a claim that an app already exists.

| Owner | Responsibility | Owned paths |
| --- | --- | --- |
| 1 | Shell, role toggle, integration, deployment | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/shell/**`, `src/components/ui/**`, package/lock/config files and deployment documentation |
| 2 | Donor entry, profile, seeded basket, tracking | `src/app/page.tsx`, `src/app/ngos/**`, `src/app/basket/**`, `src/app/donations/[contributionId]/**`, `src/features/donor/**` |
| 3 | NGO workspace and receipt/photo workflow | `src/app/ngo/**`, `src/features/ngo/**` |
| 4 | Schema, seeds, funding RPC, data/Storage wiring | `supabase/**`, `src/lib/**` including `types.ts`, backend/reset documentation |
| 5 | Mock checkout, confirmation, QA/rehearsal | `src/app/checkout/**`, `src/app/confirmation/**`, `src/features/checkout/**`, `docs/qa/**` |

- PLAN.md/AGENTS.md changes are coordinated by owner 1. Adding a path outside this map requires assigning its owner before editing. Do not implement the Later `/donations` list under the donor tracking boundary.
- Use short-lived owner/task branches and small focused commits. Merge to main every **30–45 minutes**, coordinating integration with owner 1.
- Never force push. Never rewrite another owner's files without asking that owner. Request shared UI changes from owner 1 and backend/type changes from owner 4; continue independent work within your boundary while waiting.
- Keep shared interfaces compatible with the M0 contract. Surface any required change to affected owners before modifying it.

## Intended commands

**To be added once the app exists.** These are planned commands, not existing scripts or instructions to install anything during the documentation-only task. Owner 1 must define the build/lint/typecheck scripts when scaffolding.

| Purpose | Intended command | Status |
| --- | --- | --- |
| Install | `npm install` | To be added once the app exists |
| Dev | `npm run dev` | To be added once the app exists |
| Build | `npm run build` | To be added once the app exists |
| Lint | `npm run lint` | To be added once the app exists |
| Typecheck | `npm run typecheck` | To be added once the app exists |

## Definition of done for any task

- [ ] Assigned behavior works on the golden path and respects the agreed contract and scope tags.
- [ ] Loading and error/retry states work where applicable; persisted results survive reload.
- [ ] Relevant controls are accessible at 360 px with no horizontal overflow or console errors.
- [ ] Relevant mocks have visible demo labels at use.
- [ ] Production build passes, plus configured lint/typecheck and relevant trimmed acceptance checks.
- [ ] Small commit/PR states behavior changed, validation performed and any assumptions or limitations.

## When blocked or unsure

State the assumption in the PR or commit message and continue with the safest contract-compatible work in your assigned area; do not stall. Tell the responsible owner what is blocked and the smallest interface/help needed. Use typed fixtures while waiting for backend wiring, then replace them before marking the task done. Do not guess credentials, bypass policy errors, invent successful persistence or edit someone else's files without asking. Escalate an unresolved golden-path blocker to owner 1 so the team can reassign work or apply PLAN.md's cuts.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
