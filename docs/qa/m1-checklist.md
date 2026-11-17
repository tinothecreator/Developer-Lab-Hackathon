# M1 acceptance checklist

Run against the current deployment (or explicitly record localhost), with Supabase seeded. These are the eight checks in PLAN.md; unchecked entries are not claimed as passing.

- [ ] **Join:** `/` → Ubuntu Table → **Join basket**. Fixed contents: 2 × 25 kg maize at R220/pack, 1 × 5 L oil at R110. Target R550, funded R400, remaining R150; no order. Contents cannot be edited.
- [ ] **R50:** choose R50 → **Pay (demo)**. One R50 contribution persists; total R450. Confirmation links to tracking, which says Awaiting funding. Replay the captured RPC with the exact checkout key: no extra contribution/increment. Attempt more than R100 remaining: error, unchanged funding/no order. SQL equivalent: `supabase/tests/funding-smoke.sql`.
- [ ] **R100:** return to `/basket`, choose R100, pay. Total R550; exactly one awaiting-delivery order in Supabase. Further new contributions are disabled/rejected. Existing-key replay still returns the saved result.
- [ ] **Receipt safeguards:** before full funding, `/ngo` has no order/action. On an awaiting order test wrong type, >5 MB and blank note. In browser Network controls, fail the upload request: form/photo/note remain, status stays awaiting delivery, and retry is possible.
- [ ] **Receipt success:** select a non-sensitive JPEG/PNG/WebP ≤5 MB, write a trimmed note of 1–280 characters, confirm. Observe upload before confirmation. Fail only the confirmation request once: retry reuses the uploaded path. Delivered appears only after save succeeds; confirmation control disappears/disabled after delivery.
- [ ] **Donor evidence:** open the first R50 tracking URL, then the R100 URL. Both show Delivered, the same proof photo, note and receipt time. Reload and switch roles; current data and selected NGO persist.
- [ ] **Usability:** at 360 px verify no horizontal scroll, descriptive photo alt text, labelled file/amount/note/NGO controls, visible keyboard focus, disabled pending controls, loading/empty/error/retry messages and no console errors.
- [ ] **Honest deployed demo:** run on Vercel with demo labels for payment, notification, supplier, verification and delivery. No real payment credentials. Run `npm run lint`, `npm run typecheck`, `npm run build`; reset and rehearse within three minutes.

## Verification recorded during implementation

- Initial scaffold and fixture-interface handoff: lint, typecheck and production build passed.
- Local PostgreSQL: migration applied, seed applied twice, smoke SQL passed, rollback restored 40000/55000 and zero orders.
- Final live/browser verification is reported in the task handoff. Vercel checks remain pending until connected deployment access or the dashboard steps in `docs/deployment.md` are completed.
