# Charity Eats — three-hour plan

## Assumptions

- This task creates planning documentation only. App setup, SQL, configuration, installs and deployment are future implementation tasks.
- Five owners follow the README assignments: **1** shell/integration/Vercel; **2** donor screens/tracking; **3** NGO receipt workflow; **4** Supabase/schema/seeds/RPC/Storage; **5** checkout/confirmation/QA/rehearsal.
- The clock starts when implementation begins. One disposable Supabase project, one Vercel deployment and a fixed demo donor are sufficient; there is no authentication.
- Join the existing showcase basket; its contents are already fixed. Use fictional records and a non-sensitive demo photo. All work outside the golden path is **Later** unless explicitly promoted.

## Goal

Deliver a mobile-first, persisted demonstration of Charity Eats in three hours: join Ubuntu Table's seeded basket at **R400 / R550**, pay **R50 (demo)** to reach R450, then **R100 (demo)** to reach R550 and create exactly one order. Switch to NGO view, upload a photo and note, confirm simulated receipt, then return to the first contribution's tracking page to see Delivered, the photo and the note. Payments, supplier fulfilment, notifications and verification remain visibly simulated throughout.

## Open issues

| Source difference | Planning resolution |
| --- | --- |
| README walkthrough builds a basket; SPEC requires selection and new-need posting. | User's narrower scope wins: join seeded contents. New basket creation and need posting are **Later**. |
| SPEC requires duplicate-need enforcement, need fulfilment, larger-photo view, concurrency acceptance and all 17 acceptance rows. | These are **Later**. Keep atomic funding safety now; use the eight checks below for the hackathon. |
| README says verification label “Verification mocked”; agent instructions require a visible “demo” label for every mock. | Show “Verification mocked (demo)”; likewise label payment, supplier and notification points of use. |
| SPEC leaves concrete fixture IDs and RPC signature unspecified. | Adopt the proposed M0 contract below before parallel work. |

## M0 Contract and setup (0-15 min)

**Goal:** lock the shared interface and establish a runnable shell and reachable demo backend.

| Owner | Tasks |
| --- | --- |
| 1 | Lead contract agreement; scaffold fixed stack and shared shell; establish branches, scripts and integration slots. |
| 2 | Agree donor view types, routes and seeded-basket presentation. |
| 3 | Agree order/receipt types, validation and upload-to-confirm sequence. |
| 4 | Provision disposable Supabase; agree schema, policies, fixtures, RPC and bucket; publish shared types. |
| 5 | Agree checkout key lifecycle, result handling and eight acceptance checks; prepare demo script. |

**Dependencies:** none; backend credentials and deployment accounts must be available. Owners can draft their route components against the contract while provisioning completes.

**Deliverables:** approved contract, application scaffold, shared types, Supabase project, task/file ownership and intended scripts.

**Exit criteria**

- [ ] All five owners acknowledge the contract below and their file boundaries.
- [ ] Shell starts locally; public Supabase configuration is available privately to the team.
- [ ] Each owner has a bounded task and can begin against shared types.

### Contract — agree all of this before parallel work

**TypeScript types:** one source of truth, `src/lib/types.ts`, maintained by owner 4. Money fields are integer cents; IDs are UUID strings and timestamps ISO strings. Agree these exact fields/unions; route views compose them rather than redefine them.

| Type | Fields |
| --- | --- |
| `NGO` | `id`, `name`, `city`, `province`, `mission`, `registration_number`: strings |
| `CatalogueItem` | `id`, `name`, `pack_label`, `supplier_name`: strings; `price_cents`: number; `active`: boolean |
| `Need` | `id`, `ngo_id`, `catalogue_item_id`, `note`, `week_start`: strings; `quantity_packs`: number; `status`: `NeedStatus` |
| `Basket` | `id`, `ngo_id`, `created_at`: strings; `status`: `BasketStatus`; `target_cents`, `funded_cents`: number |
| `BasketItem` | `id`, `basket_id`, `need_id`, `catalogue_item_id`: strings; `quantity_packs`, `unit_price_cents`: number |
| `Contribution` | `id`, `basket_id`, `demo_donor_id`, `checkout_key`, `created_at`: strings; `amount_cents`: number; `status`: `ContributionStatus` |
| `Order` | `id`, `basket_id`, `created_at`: strings; `status`: `OrderStatus`; `proof_photo_path`, `receipt_note`, `delivered_at`: string or null |
| `ContributionResult` | `contribution_id`, `basket_id`: strings; `amount_cents`, `funded_cents`, `target_cents`: number; `basket_status`: `BasketStatus`; `order_id`: string or null |

**Routes:** route ownership follows AGENTS.md; the seeded entry routes contain only what the walkthrough needs.

| Route | Tag | Agreed capability |
| --- | --- | --- |
| `/` | Demo path | Entry link to Ubuntu Table; shared role toggle |
| `/ngos/[id]` | Demo path | Ubuntu profile, seeded needs and join-basket link |
| `/basket` | Demo path | Read-only seeded contents, funding and amount selection |
| `/checkout` | Demo path | Amount summary, “Pay (demo)”, validation/retry |
| `/confirmation/[contributionId]` | Demo path | Persisted contribution, progress and tracking link |
| `/donations/[contributionId]` | Demo path | Persisted status and receipt photo/note/time |
| `/ngo` | Demo path | NGO selector and selected NGO's funded order link |
| `/ngo/orders/[orderId]` | Demo path | Receipt photo, note and confirmation |
| `/donations` | Later | Contribution history list |

New-basket editing on `/basket`, new-need form on `/ngo`, and richer browsing of the other NGOs are **Later** capabilities on existing routes; do not add extra routes for them now.

**Statuses:** `BasketStatus = 'funding' | 'funded'`; `ContributionStatus = 'paid'`; `OrderStatus = 'awaiting_delivery' | 'delivered'`; `NeedStatus = 'open' | 'fulfilled'`. Seed needs stay `open`; implementing `open → fulfilled` is **Later**. Donor text is “Awaiting funding” without an order, “Awaiting delivery” for an awaiting order, “Delivered” after receipt; accompany the latter with “Delivery simulated (demo)”. Full funding creates a local demo order only.

**Seed IDs:** fixed UUIDs below are proposed constants, never IDs inferred from display names. Owner 4 owns repeatable seeds and a developer-run reset; no reset UI. For compactness, `U(n)` means the UUID `00000000-0000-4000-8000-` followed by `n` padded to 12 decimal digits (for example `U(1) = 00000000-0000-4000-8000-000000000001`).

| Record | IDs / initial values |
| --- | --- |
| NGOs | `U(1)` Ubuntu Table; `U(2)` Cape Neighbourhood Pantry; `U(3)` eThekwini Family Food Hub; `U(4)` Mthatha Early Years Pantry; `U(5)` Mangaung Community Meals |
| Catalogue | `U(101..108)` in SPEC order: maize, oil, rice, beans, samp, lentils, formula, oats; retain SPEC pack sizes/prices |
| Needs | `U(201..210)` in SPEC NGO/initial-needs order, two rows per NGO; Ubuntu maize `U(201)` quantity 2, oil `U(202)` quantity 1; fixed week start `2026-11-16` |
| Showcase basket | `U(301)`, NGO `U(1)`, `funding`, target `55000`, funded `40000`; no order |
| Showcase items | `U(401)` → need `U(201)`, 2 × `22000`; `U(402)` → need `U(202)`, 1 × `11000` |
| Donor identities | Current donor `U(501)`; fictional seed donors `U(502)`, `U(503)` |
| Seed contributions | `U(601)`, `U(602)`: `20000` each, `paid`, basket `U(301)`, respective seed donors; checkout keys `U(701)`, `U(702)` |
| Runtime records | New contribution/order IDs and checkout keys generated as UUIDs; obtain order ID from RPC, never hard-code it |

**Atomic contribution RPC:** exactly one Postgres function, `public.contribute_to_basket`, invoked using `supabase.rpc('contribute_to_basket', args)`. No separate client writes for payment, totals or order creation.

| Contract part | Agreement |
| --- | --- |
| Arguments | `p_basket_id: uuid`, `p_demo_donor_id: uuid`, `p_amount_cents: integer`, `p_checkout_key: uuid` |
| Return shape | One JSON object matching `ContributionResult`; clients treat RPC errors as failures, never success |
| Transaction | Lock basket; validate positive integer amount and remaining balance; insert paid contribution, update total/status and create one order at exactly full funding atomically |
| Idempotency | Unique checkout key. Same key and same basket/donor/amount returns the existing contribution plus current basket/order state without another increment; changed payload with same key errors. Handle retries under the lock/uniqueness constraint. |
| Constraints/errors | Unique order per basket, unique checkout key, funded total never above target. Reject unknown basket, invalid amount, closed basket or excessive amount with a readable error; refresh remaining balance after rejection. Check idempotent replay before rejecting a now-funded basket. |
| Client lifecycle | Generate one key per checkout attempt; preserve it during double clicks, retries and uncertain responses. A changed amount starts a new attempt/key. Disable Pay while submitting. |

**Storage:** bucket `delivery-proofs`; object path `<orderId>/<uploadUuid>.<extension>`. Explicit demo Postgres/Storage policies, public bucket only for non-sensitive photos, JPEG/PNG/WebP up to 5 MB enforced in UI and upload path. Upload first; save path plus trimmed 1–280-character note, timestamp and delivered status only after success. Failed upload/update leaves awaiting delivery and preserves the form; reuse a successful upload on retry. No service-role key in the browser.

## M1 Parallel build (15-75 min)

**Goal:** build independent golden-path pieces against the frozen contract.

| Owner | Tasks |
| --- | --- |
| 1 | Build mobile shell, persistent demo role toggle, navigation and shared loading/error presentation; prepare Vercel project. |
| 2 | Build Ubuntu profile, join seeded basket, amount selection and contribution tracking with typed fixtures first. |
| 3 | Build funded-order view and receipt form with preview, file/note validation, loading and retry states. |
| 4 | Implement schema, repeatable seeds, explicit policies, single atomic RPC, Storage upload/read wiring and reset instructions; smoke-test RPC. |
| 5 | Build checkout/confirmation, stable attempt keys, pending button state and result handling; prepare QA data and script. |

**Dependencies:** M0 contract; owners 2/3/5 use fixtures until owner 4's interfaces are live. Owner 1 can deploy the shell independently.

**Deliverables:** independently usable route components, database and Storage interfaces, seed/reset procedure; small merges during the window.

**Exit criteria**

- [ ] All Demo path routes render with agreed types and links.
- [ ] Reset produces R400 / R550 with no order; RPC can persist R50 then R100 and create one order.
- [ ] Upload and receipt UI validate required photo/note and show failure states.
- [ ] Checkout preserves an attempt key on retry and disables submission while pending.

## M2 Golden path connected (75-105 min)

**Goal:** complete one persisted donation-to-proof loop locally.

| Owner | Tasks |
| --- | --- |
| 1 | Integrate route links and role changes; coordinate merges; refresh data on navigation/role switch. |
| 2 | Replace fixtures with persisted reads; show R400 → R450 → R550 and linked order evidence. |
| 3 | Connect upload then receipt update; retain form on failure; prevent partial/repeated confirmation. |
| 4 | Support RPC/policy integration; verify idempotent retry, overfunding rejection and one-order constraint in Postgres. |
| 5 | Connect checkout to RPC and confirmation to saved contribution; run the complete script and log blockers. |

**Dependencies:** owner 4's live reads/RPC/Storage unblock owners 2/3/5; their connected routes unblock owner 1's end-to-end integration and owner 5's QA.

**Deliverables:** persisted local golden path, resettable data and a ranked blocker list.

**Exit criteria**

- [ ] R50 persists once, shows R450 and links to first-contribution tracking.
- [ ] R100 reaches R550 and creates exactly one awaiting-delivery order.
- [ ] NGO photo/note confirmation persists; donor tracking shows Delivered and evidence after reload.
- [ ] Same-key retry does not increment funds; excessive amount leaves funds unchanged.

## M3 Deploy and harden (105-140 min)

**Goal:** make the golden path reliable on the deployed URL.

| Owner | Tasks |
| --- | --- |
| 1 | Deploy Vercel with public Supabase env vars; run production build and configured lint/typecheck; fix shell/navigation issues. |
| 2 | Check donor screens at 360 px and with keyboard; fix stale progress/evidence and missing error states. |
| 3 | Test deployed upload, invalid file and retry; enforce note validation and prevent premature success. |
| 4 | Verify deployed policies, bucket limits and persisted constraints; fix denied reads/writes and document reset. |
| 5 | Smoke-test deployed walkthrough, same-key retry, excessive amounts and all point-of-use demo disclosures; triage blockers. |

**Dependencies:** connected M2 flow; owner 1's deployment/env configuration enables deployed QA; owner 4 resolves backend access failures.

**Deliverables:** working Vercel URL, passing build/checks and no unresolved golden-path blocker.

**Exit criteria**

- [ ] Deployed app can read fixtures, call RPC and upload/view proof.
- [ ] Production build and configured lint/typecheck pass.
- [ ] Golden path has labelled controls, readable statuses and no horizontal overflow at 360 px.
- [ ] Payment, supplier, notification and verification mocks show visible demo labels where used.

## M4 Verify and rehearse (140-165 min)

**Goal:** pass the trimmed acceptance checklist on Vercel and rehearse within three minutes.

| Owner | Tasks |
| --- | --- |
| 1 | Monitor deployed build and navigation; resolve integration blockers only. |
| 2 | Verify first and second contributions share the same evidence after reload/role switch. |
| 3 | Supply non-sensitive rehearsal photo/note; verify receipt retry and disabled delivered form. |
| 4 | Inspect persisted totals/contributions/order/evidence; run developer reset between rehearsals. |
| 5 | Lead all eight checks, record results and time the walkthrough; assign a presenter and backup. |

**Dependencies:** stable M3 URL and reset procedure; owner 4's reset enables repeatable rehearsals.

**Deliverables:** checked acceptance list, rehearsed script, demo photo/note and known limitations.

**Exit criteria**

- [ ] All eight acceptance checks pass on Vercel with database evidence where specified.
- [ ] One complete rehearsal takes three minutes or less.
- [ ] Reset restores R400 / R550, no order and no receipt evidence.

## M5 Freeze (165-180 min)

**Goal:** preserve a working demo and prepare the final presentation.

| Owner | Tasks |
| --- | --- |
| 1 | Freeze features; accept only demo-blocker fixes; confirm final deployed revision and URL. |
| 2 | Spot-check donor entry and tracking links on final revision. |
| 3 | Keep receipt photo/note ready and confirm NGO handoff. |
| 4 | Restore starting fixtures after final rehearsal; verify R400 and no order. |
| 5 | Lead final rehearsal, record limitations, verify presenter/backup and update tracker. |

**Dependencies:** M4 acceptance and rehearsal; any blocker fix requires rerunning affected checks before the final reset.

**Deliverables:** frozen deployed demo, seeded starting state and ready presenter.

**Exit criteria**

- [ ] Final revision has passing build/checks and any changed-path checks rerun.
- [ ] Deployed starting state is R400 / R550 with no order.
- [ ] Presenter can open the URL and has the demo photo, note and script ready.
- [ ] No new feature work is being merged.

## Dependencies and immediate starts

| Owner / work | Blocked by | Can start immediately after M0 |
| --- | --- | --- |
| 1 shell/navigation/deployment preparation | All route owners for full integration; account/env access for deploy | Shell, role toggle, mobile layout, Vercel preparation |
| 2 donor/tracking | 4 for persisted data; 5 for contribution handoff | Typed fixture screens and links |
| 3 NGO proof | 4 for order queries, policies and Storage | Form, preview, validation, retry UI |
| 4 backend | Contract agreement and Supabase access | Schema, seed, atomic RPC, policies, bucket |
| 5 checkout/QA | 4 for RPC; 2/3 and deployed URL from 1 for full QA | Checkout with typed result fixture, key lifecycle, QA script |

## Cut list

All non-golden-path work is **Later** from the start: new basket creation, new-need posting, duplicate-need rule, need → fulfilled transition, `/donations` list, accessible larger-photo view, concurrency stress testing, full 17-row acceptance table, rich five-NGO browsing, realtime, optional images, animations and component-library embellishments. Keep descriptive photo alt text and keyboard access now. Other SPEC exclusions remain **Later**, including real integrations and authentication.

At the **end of M2**, cut in this order if behind:

1. Optional artwork, animation, shadcn adoption and visual refinements.
2. Rich entry/profile presentation; keep Ubuntu's name, needs, prices, labels and join link.
3. Extra amount shortcuts; keep a validated amount control that supports R50 then R100.
4. Any stretch work accidentally started from **Later**; return its owner to a golden-path blocker.

At the **end of M3**, cut in this order if behind:

1. Remaining cosmetic work and nonessential presentation changes.
2. Extra QA exploration outside the eight checks; concurrency stress and full acceptance stay **Later**.
3. Extra pitch material and additional rehearsal variants; keep one timed golden-path rehearsal.

Never cut atomic RPC safety, persistence, real Storage upload for demo evidence, required validation/retry, mobile usability or simulation labels. If any is broken, put all available owners on that blocker and report it plainly; do not fake a passing flow.

## Trimmed acceptance checklist

These eight checks replace the SPEC's 17-row table for this hackathon. Owner 5 records results; owner 4 checks stored data.

- [ ] **Join:** from donor entry, open Ubuntu Table and join fixed 2 × maize + 1 × oil basket: target `55000`, funded `40000`, remaining `15000`, no order.
- [ ] **R50:** “Pay (demo)” persists one `5000` paid contribution, shows R450 / R550 and Awaiting funding; confirmation links to its tracking page. Same-key replay produces no second contribution/increment; an excessive amount is rejected without changing totals or creating an order.
- [ ] **R100:** a new checkout for `10000` reaches `55000`; exactly one awaiting-delivery order exists in Postgres and further contributions are disabled/rejected.
- [ ] **Receipt safeguards:** partially funded basket has no delivery action; invalid type, >5 MB photo or invalid note is rejected. Simulated upload failure keeps awaiting delivery and preserves retry input.
- [ ] **Receipt success:** NGO uploads a valid photo and trimmed 1–280-character note; stored path/note/time and delivered status appear only after upload and save succeed; repeat confirmation is disabled.
- [ ] **Donor evidence:** return to the first R50 tracking page: Delivered, photo, note and receipt time appear; R100 tracking resolves to the same order/evidence. Reload and role switching preserve current state.
- [ ] **Usability:** complete the script at 360 px with no horizontal overflow and labelled, keyboard-usable controls; loading/error feedback works and there are no console errors.
- [ ] **Honest deployed demo:** the script works on Vercel, every mock has a visible demo label at use, no real payment credentials are requested, build/configured checks pass and reset enables a ≤3-minute rehearsal.

## Risks

| Risk | Mitigation / owner |
| --- | --- |
| Integration drift | M0 types/routes/RPC contract, fixtures shaped like real responses, owner 1 coordinates changes; merge every 30–45 minutes. |
| Supabase policy errors | Owner 4 smoke-tests reads, RPC and Storage with the anon client early; use explicit restricted demo policies, never a browser service-role workaround. |
| Upload failures | Owner 3 preserves form and retries; owner 4 checks bucket/type/size policies; upload before delivered update and reuse successful object on retry. |
| Vercel env vars | Owner 1 sets public URL/anon key in deployment environment, redeploys after changes and tests deployed backend access before M3 ends. |
| Time overrun | Owner 5 calls milestone gates; apply ordered cuts, reassign available owners to blockers and freeze features at minute 165. |

## Progress tracker

Update these only when every exit criterion for that milestone is met. Leave unchecked until implementation occurs.

- [ ] M0 Contract and setup — owner 1 records agreement and setup readiness.
- [ ] M1 Parallel build — owners 1–5 confirm their deliverables.
- [ ] M2 Golden path connected — owner 5 records local walkthrough; owner 4 confirms persistence.
- [ ] M3 Deploy and harden — owner 1 records URL/revision and passing checks.
- [ ] M4 Verify and rehearse — owner 5 records eight results and rehearsal duration.
- [ ] M5 Freeze — owner 1 confirms revision; owner 4 confirms starting fixtures; owner 5 confirms readiness.
