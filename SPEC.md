# Charity Eats — MVP specification

## Objective and constraints

Build a working mobile-first demo in **three hours with five people**. Show a complete loop: an NGO posts a specific need, donors pool money toward the required groceries, and the NGO confirms delivery with a photo and note visible to contributors.

The fixed stack is **Next.js App Router + TypeScript, Tailwind CSS, Supabase Postgres + Storage, and Vercel**. shadcn/ui is optional. This specification describes planned application behaviour; the current task produces documentation only.

The problem framing uses the brief's estimate of around 17.8 million food-insecure people in South Africa. Its original source and date must be verified before publication as a sourced statistic.

## Product principles

1. **Needs come first.** Every selectable grocery item belongs to an NGO's posted weekly needs.
2. **Small contributions count.** A donor can contribute R50 without funding an entire bulk basket.
3. **Close the loop.** Every delivered order has a visible receipt photo and short NGO note.
4. **Make simulation clear.** Keep demo payment, supplier, notification, and verification labels visible at the relevant action.

## Roles and scope

Use a persistent **Donor / NGO** demo toggle. NGO view includes a selector for the five seeded organisations. A fixed demo donor identity owns new contributions; seeded contributions represent other fictional donors. These are UI contexts, not authentication or authorisation.

### Required

- Donor: browse NGO profiles, read current needs, add requested items to a basket, contribute via mock checkout, and see confirmation.
- Shared funding: persist multiple contributions against one bulk basket and display funded amount, target, and remaining amount.
- NGO: post a need, view orders, upload a delivery photo, and mark receipt with a short note.
- Tracking: donor sees each contribution's basket, amount, delivery status, and receipt evidence when available.
- Seed fixtures: five realistic but fictional South African NGO profiles, one fake supplier catalogue, and a partially funded showcase basket.

### Mocked

| Area | Required demo implementation | Future integration |
| --- | --- | --- |
| Payment | “Pay (demo)” records a simulated paid contribution; never request payment credentials | PayFast or Paystack |
| Notifications | Toast or inline message after contribution and delivery confirmation | Email / WhatsApp |
| Supplier | Static catalogue; local order record only; delivery is manually simulated | Supplier ordering and logistics |
| NGO verification | Store a fictional registration number and display “Verification mocked” | Registration and eligibility checks |

### Excluded

User accounts, login, tax certificates, multi-supplier routing, real payments, and admin dashboard. Also defer maps, recurring giving, refunds, stock management, delivery scheduling, and automated dispatch. They are not needed to demonstrate the core loop.

## Screens and routes

| Planned route | Contents and actions |
| --- | --- |
| `/` | NGO cards: name, area, mission, current need summary, and mocked verification label |
| `/ngos/[id]` | NGO profile, weekly needs with quantities and prices, shared basket progress, add-to-basket/join-funding actions |
| `/basket` | One NGO's requested items, quantities, full target value, existing funding, remaining balance, contribution amount |
| `/checkout` | Contribution summary, simulation notice, and Pay (demo) action |
| `/confirmation/[contributionId]` | Simulated payment success, contributed amount, pooled progress, and tracking link |
| `/donations` | Current demo donor's persisted contributions with linked order status |
| `/donations/[contributionId]` | Contribution, shared basket contents, progress, order status, receipt photo and note |
| `/ngo` | Selected NGO's needs, new-need form, and funded orders |
| `/ngo/orders/[orderId]` | Order contents and receipt form: photo, short note, confirm delivery |

The role toggle is available in the shared shell. Route grouping may change during implementation if these capabilities remain accessible.

## Basket and pooled funding rules

- One basket belongs to one NGO and one fixed supplier. Prevent combining NGOs in a basket; ask the donor to finish or clear the current selection before changing NGO.
- Donors select full catalogue packs against posted quantities. Basket targets are calculated from item price snapshots in integer cents; display currency as South African rand (ZAR).
- For the demo, an NGO has at most one active shared basket. Its contents become fixed when the first paid contribution is recorded. Later donors join that basket; they cannot change its contents or quantities. Posting another need does not modify an existing funded target.
- Before the first contribution, requested quantities may be selected up to the posted outstanding need. Link each basket item to its need so the same need cannot be included in another active basket.
- Allow any positive contribution in whole cents up to the remaining balance. Offer R50, R100, and “Fund remaining” shortcuts; disable shortcuts that exceed the balance.
- Reject zero, negative, invalid, and overfunding amounts. Do not silently round or reduce a donor's chosen amount.
- The target is the sum of quantity × unit price. Delivery is free in the demo and labelled as such. No extra fees are added.
- Count only simulated paid contributions in the funded total. Creating a basket or opening checkout contributes nothing.
- Commit payment, total update, and order creation atomically in Postgres, using a locked basket row or equivalent concurrency protection. Recheck the remaining balance on submission.
- Give each checkout attempt a unique key and enforce uniqueness server-side so double clicks or retries do not charge the pool twice. Disable Pay while submitting.
- If another donor fills the remaining balance first, refresh progress and ask the donor to choose a new amount; show no success confirmation for a rejected contribution.
- At exactly full funding, create **one** order and stop accepting contributions. All contributors see the same order and delivery proof.

### Status model

| Record | States and transitions |
| --- | --- |
| Basket | `funding` → `funded` when paid total equals target |
| Contribution | `paid` only after successful mock checkout; no pending record required |
| Order | Created as `awaiting_delivery` only at full funding → `delivered` after receipt confirmation |
| Need | `open` → `fulfilled` when the linked basket's order is delivered |

The donor UI shows “Awaiting funding” while no order exists, “Awaiting delivery” after full funding, and “Delivered” after receipt. No supplier dispatch event is implied by full funding. An NGO cannot mark a partially funded basket delivered.

## NGO needs and proof of delivery

New-need form fields: catalogue item, positive integer pack quantity, short explanatory note, and week-start date. Item selection supplies its pack size and price, avoiding a separate product editor. Reject blank required fields and duplicate open needs for the same NGO, item, and week.

For an awaiting-delivery order, require a **JPEG, PNG, or WebP photo up to 5 MB** and a trimmed **1–280 character receipt note**. Show a preview and an upload-in-progress state. Validate file type and size in the upload path as well as in the UI.

Upload the photo to Supabase Storage before saving its object path and receipt note on the order. Set `delivered_at` and transition status only after both upload and database update succeed. On failure, preserve the form, show a retry message, and leave the order awaiting delivery. Reuse the uploaded object on retry where possible. Disable repeated confirmation after delivery.

Display the stored photo, note, and receipt time on every linked contribution's tracking screen. Use descriptive image alt text and an accessible larger-photo view. Use only non-sensitive demo images.

## Minimal data model

Use UUID primary keys unless noted, foreign keys for relationships, and timestamps on mutable records. Store money in integer cents, never floating point. Core fields:

| Table | Fields |
| --- | --- |
| `ngos` | `id`, `name`, `city`, `province`, `mission`, `registration_number` |
| `catalogue_items` | `id`, `name`, `pack_label`, `price_cents`, `supplier_name`, `active` |
| `needs` | `id`, `ngo_id`, `catalogue_item_id`, `quantity_packs`, `note`, `week_start`, `status` |
| `baskets` | `id`, `ngo_id`, `status`, `target_cents`, `funded_cents`, `created_at` |
| `basket_items` | `id`, `basket_id`, `need_id`, `catalogue_item_id`, `quantity_packs`, `unit_price_cents` |
| `contributions` | `id`, `basket_id`, `demo_donor_id`, `amount_cents`, `status`, `checkout_key`, `created_at` |
| `orders` | `id`, `basket_id`, `status`, `proof_photo_path`, `receipt_note`, `delivered_at`, `created_at` |

Constraints: positive prices, pack quantities, and contribution amounts; `0 <= funded_cents <= target_cents`; unique `checkout_key`; unique order per `basket_id`; valid status values; receipt fields required for delivered orders. Enforce one active basket per NGO and prevent the same need being assigned twice. Keep aggregate funding consistent through the single atomic contribution mutation.

No users or authentication tables are required. The demo donor ID is a fixture identifier, not a user account. Registration-number storage must never result in a claim of actual verification.

### Supabase and access

- Keep NGOs, needs, catalogue, contributions, funding totals, and delivery metadata in Postgres so role switching and reloads retain state.
- Store images in the `delivery-proofs` bucket and object paths on orders. For this demo, a public bucket is acceptable only for non-sensitive fixture photos; otherwise use signed URLs.
- Configure explicit Postgres and Storage policies for the disposable, unauthenticated demo environment. The role toggle provides no data isolation. Restrict permitted operations and file constraints where possible; production requires authentication and role-based ownership checks.
- Use public Supabase configuration in the client. Any service-role secret, if implementation requires one, stays server-side and never uses a `NEXT_PUBLIC_` variable.
- Keep seeds repeatable without duplicating records. Document a developer-run fixture reset for rehearsal; no reset/admin interface is required.

## Seed fixtures

All names, registration identifiers, needs, and prices below are **fictional demo fixtures**. They illustrate South African locations and grocery needs without claiming affiliation with a real organisation. Prices are illustrative, not live supplier quotations.

### NGOs

| Name | Location | Mission | Demo registration identifier | Initial needs |
| --- | --- | --- | --- | --- |
| Ubuntu Table Community Kitchen | Soweto, Gauteng | Community meals for local households | DEMO-NPO-001 | 2 × maize meal; 1 × cooking oil |
| Cape Neighbourhood Pantry | Khayelitsha, Western Cape | Weekly household grocery support | DEMO-NPO-002 | 2 × rice; 3 × baked beans |
| eThekwini Family Food Hub | Umlazi, KwaZulu-Natal | Food parcels for families | DEMO-NPO-003 | 2 × samp; 2 × lentils |
| Mthatha Early Years Pantry | Mthatha, Eastern Cape | Grocery support for caregivers | DEMO-NPO-004 | 2 × baby formula; 2 × oats |
| Mangaung Community Meals | Bloemfontein, Free State | Community meal preparation | DEMO-NPO-005 | 2 × rice; 1 × cooking oil |

### Catalogue: Mzansi Bulk Foods (fictional supplier)

| Item | One catalogue pack | Price | Stored cents |
| --- | --- | --- | --- |
| Maize meal | 25 kg bag | R220.00 | 22000 |
| Cooking oil | 5 L bottle | R110.00 | 11000 |
| Rice | 10 kg bag | R180.00 | 18000 |
| Baked beans | 6 × 410 g cans | R90.00 | 9000 |
| Samp | 10 kg bag | R140.00 | 14000 |
| Dry lentils | 5 kg bag | R160.00 | 16000 |
| Baby formula | 900 g tin | R220.00 | 22000 |
| Oats | 5 kg bag | R110.00 | 11000 |

Show the NGO's requested formula product as a catalogue item only; the demo does not recommend infant feeding choices or substitutions.

### Showcase funding fixture

- Ubuntu Table has an active basket containing two maize meal bags and one oil bottle: `(2 × R220) + R110 = R550`.
- Two fictional other-donor contributions of R200 each seed the pool at **R400 / R550**. No order exists yet.
- Current demo donor contributes **R50**, reaching **R450 / R550**, and can track that contribution.
- A second simulated checkout for **R100** reaches **R550 / R550** and creates one awaiting-delivery order. This may use the same demo donor; it demonstrates the remaining funding step alongside the seeded other donors.
- The NGO uploads proof and confirms receipt. Both new contributions link to the same delivered order and photo.

## UX requirements

- Design for a 360 px viewport first: readable cards, labelled controls, large tap targets, and no horizontal overflow.
- Keep NGO name, requested pack sizes, rand prices, remaining funding, and simulation labels visible where the donor decides to contribute.
- Show loading, empty, validation-error, and retry states on data-dependent screens. Preserve basket choices and form values after recoverable failures.
- Pair status colours with text, provide visible keyboard focus, associate labels with inputs, and announce result messages accessibly.
- Show photo upload progress and prevent confirmation until upload completes. Avoid a success state before the database mutation succeeds.
- Refresh persisted data after mutations, on role switching, and when opening tracking. Realtime subscriptions are optional.

## Three-hour delivery plan

| Time | Team checkpoint |
| --- | --- |
| 0–15 min | Agree types, routes, statuses, seed IDs, and mutation interfaces; create app and Supabase project |
| 15–75 min | Build donor, NGO, checkout, and database workflows concurrently using the agreed contract |
| 75–105 min | Connect persistence, atomic funding, order creation, and Storage uploads; complete shared flow |
| 105–140 min | Integrate mobile UI, fix critical failures, deploy to Vercel with environment variables |
| 140–165 min | Run acceptance checks on deployed app; reset fixtures and rehearse |
| 165–180 min | Freeze features, resolve only demo blockers, and rehearse the three-minute pitch |

Owners: person 1 handles shell/integration/deployment; person 2 donor screens; person 3 NGO screens/proof; person 4 schema/seeds/funding/Storage; person 5 checkout/confirmation/QA. Agree the basket and contribution interfaces before parallel implementation to prevent integration drift.

If time is tight, reduce visual polish, optional images, and component-library work. Preserve NGO-posted needs, small pooled contributions, and visible delivery evidence.

## Acceptance checks

Run manually against the deployed demo. Check database persistence, not just the visible success message.

| Check | Expected result |
| --- | --- |
| Browse seed NGOs | Five profiles show South African locations, current needs, rand prices, and mocked verification labels |
| Post a need | Valid catalogue item, quantity, note, and week save for the selected NGO and appear in Donor view after refresh |
| Invalid need | Empty required fields, non-positive quantities, and duplicate open item/week needs are rejected |
| Select groceries | Basket references one NGO's posted needs, uses valid pack quantities, and totals correctly |
| Join showcase basket | Fixed contents show a R550 target and R400 already funded |
| Pay R50 | Exactly one simulated paid contribution persists; total becomes R450; confirmation links to tracking |
| Payment retry / double click | Reusing one checkout key creates no duplicate contribution or funding increase |
| Invalid or excessive amount | Contribution is rejected without changing funding or creating an order |
| Competing contributions | Concurrent submissions cannot exceed R550; stale submissions receive refreshed remaining funding |
| Pay remaining R100 | Pool reaches R550 and exactly one awaiting-delivery order exists; further funding is disabled |
| Partial funding receipt attempt | No order or deliver action is available before full funding |
| Confirm receipt | Valid photo and note persist; order becomes delivered and linked needs become fulfilled |
| Invalid/failed upload | Wrong type, oversized file, or failed upload leaves status unchanged and offers a retry |
| View donor evidence | Both new contributions show the same delivered order, visible photo, note, and receipt timestamp |
| Reload and switch roles | Needs, contributions, totals, and delivery proof remain persisted and current |
| Mobile and keyboard use | Main flow works at 360 px width without horizontal scrolling; controls are labelled and keyboard usable |
| Simulation disclosure | Payment, supplier, notification, and verification mocks are clearly labelled; no real credentials or notifications requested |

The demo is complete when these checks pass on Vercel and the team can rehearse the README walkthrough from a repeatable seed state. Run the eventual project's production build and any configured type/lint checks before the feature freeze.
