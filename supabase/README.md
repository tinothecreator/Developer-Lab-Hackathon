# Demo backend

All records are fictional. Anonymous reads are intentionally public. Direct anonymous writes to contributions, baskets and orders are denied. Funding uses only `contribute_to_basket`; receipt confirmation uses the narrow `confirm_delivery` RPC. Both are SECURITY DEFINER functions with a fixed empty search path and explicit execute grants. The UI role toggle is not authorisation.

## SQL Editor setup

1. Open the disposable Supabase project, then **SQL Editor → New query**.
2. Paste all of `supabase/migrations/202611170001_demo_contract.sql`, then click **Run** once. This creates the tables, constraints, policies, RPCs and public `delivery-proofs` bucket.
3. In a new query, paste all of `supabase/seed.sql` and click **Run**. It resets the demo to R400/R550, two R200 seed contributions and no order. Running this seed again produces the same starting state.
4. In a third query, paste `supabase/tests/funding-smoke.sql` and click **Run**. It checks R50, replay, excess/zero/reused-key rejection, R100, one order, replay after full funding, missing-proof rejection and anonymous write denial. The test rolls back, preserving the seeded starting state.
5. Under **Storage → delivery-proofs**, verify public access, size limit **5,242,880 bytes**, and MIME types **image/jpeg**, **image/png**, **image/webp**.
6. Privately set the public URL and anon key in `.env.local`, then restart the app. Never print or commit the file. There is no service-role dependency.

## One-command reset

With PostgreSQL `psql` installed and your developer-only connection configured privately through standard `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE` and password storage:

```sh
psql -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

Do not place database passwords in the repo or browser configuration. Without `psql`, rerun the seed in SQL Editor. Reset intentionally removes demo contributions and orders. Old non-sensitive proof objects remain in Storage; remove those through the Storage dashboard if desired, never by editing `storage.objects` directly.

## Receipt contract

Only JPEG/PNG/WebP files of 1 byte through 5 MB are accepted by the service; the bucket independently enforces maximum size and MIME type. Upload path is `<orderId>/<uploadUuid>.<jpg|png|webp>`. The insert policy only permits matching awaiting-delivery orders. Objects cannot be overwritten through anonymous policies.

Upload first, then call `confirm_delivery` with the saved path and trimmed 1–280 character note. It checks that the object exists, locks the order and atomically saves the receipt, time and delivered status. Retrying the same saved receipt is idempotent; changing an already delivered receipt fails. Seed needs remain open; need fulfilment is Later.

Local PostgreSQL validation uses the actual migration and smoke SQL with stub Storage tables; this validates SQL and anonymous table policies but does not certify the hosted Storage service. Real upload/receipt validation is recorded in `docs/qa/m1-checklist.md`.
