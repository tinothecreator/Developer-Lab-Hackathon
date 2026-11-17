# Charity Eats M1 acceptance checklist

Run against the disposable Supabase demo project after applying the migration and seed in [backend-reset.md](../backend-reset.md). These are the eight trimmed Plan checks; do not use real people or sensitive photos.

Before starting, reset the database to R400 / R550 with no order, configure the two public Supabase values, then run `npm run dev` or open the deployed Vercel URL.

1. [ ] **Join:** Open `/`, go to Ubuntu Table, and join the fixed 2 × maize + 1 × oil basket. Confirm R550 target, R400 funded, R150 remaining, and no order.
2. [ ] **R50 and retry:** Pay R50 (demo). Confirm one paid 5000-cent contribution, R450 / R550, “Awaiting funding,” and a tracking link. In the same browser session, inspect `JSON.parse(sessionStorage.getItem('charity-eats-checkout:<basket-id>')).checkoutKey`, then replay that key with the same basket, donor and amount in the Supabase SQL Editor:

   ```sql
   select public.contribute_to_basket(
     '00000000-0000-4000-8000-000000000301',
     '00000000-0000-4000-8000-000000000501',
     5000,
     '<checkout-key-from-session-storage>'
   );
   ```

   Verify the contribution ID and funded total are unchanged. Try an amount above the remaining balance and verify it is rejected.
3. [ ] **R100:** Start a new checkout by choosing R100. Confirm funded total reaches 55000, the basket is funded, exactly one `awaiting_delivery` order exists, and further contributions are disabled/rejected.
4. [ ] **Receipt safeguards:** Before full funding, verify no delivery action exists. On a funded awaiting order, reject a non-image, a photo over 5 MB, and a blank or over-280-character note. Simulate an upload/update failure and confirm the order remains awaiting delivery and the form stays available.
5. [ ] **Receipt success:** Upload a non-sensitive JPEG/PNG/WebP photo and a trimmed 1–280-character note. Confirm the order becomes delivered only after upload and save; verify path, note and timestamp persist and the action is disabled.
6. [ ] **Donor evidence:** Return to the R50 tracking page and verify Delivered, photo, note and receipt time. Open the R100 tracking page and verify it shows the same order evidence. Reload and switch roles; state remains current.
7. [ ] **Usability:** Complete the flow at 360 px with no horizontal scrolling. Check labels, keyboard focus, loading/empty/error/retry feedback and browser console.
8. [ ] **Honest demo and reset:** Confirm each mock is visibly labeled “demo,” no payment credentials are requested, and configured lint/typecheck/build pass. Reset and verify R400 / R550, no order and no receipt evidence.

Useful read-only SQL checks:

```sql
select b.funded_cents, b.target_cents, b.status, count(o.id) as order_count
from public.baskets b
left join public.orders o on o.basket_id = b.id
where b.id = '00000000-0000-4000-8000-000000000301'
group by b.id;

select id, amount_cents, status, checkout_key
from public.contributions
where basket_id = '00000000-0000-4000-8000-000000000301'
order by created_at;
```
