# Charity Eats demo

Build the fictional, unauthenticated hackathon demo with Next.js App Router, TypeScript, Tailwind and Supabase Postgres/Storage. Follow `AGENTS.md`, `PLAN.md` and `CODING_STANDARDS.md`; the Demo path is in scope and Later items stay out.

- Golden path: join Ubuntu Table's fixed R550 basket at R400, record R50 then R100 through `contribute_to_basket`, then upload a non-sensitive receipt photo and note.
- Keep money in integer cents. Shared domain types belong only in `src/lib/types.ts`; UI calls `src/lib/services/`, never Supabase directly.
- Keep checkout keys stable for an attempt. Postgres performs contribution, total update and order creation atomically.
- Use explicit demo RLS and Storage policies. Only the public Supabase URL and anon key are allowed in `NEXT_PUBLIC_` configuration; never use a service-role key.
- Label every mock at its point of use. No auth, real payments, real verification, or real delivery.
- Build mobile-first at 360 px with accessible labels, visible focus, and loading/error/retry states. Validate proof images (JPEG/PNG/WebP, 5 MB max) and trimmed notes (1–280 chars).
