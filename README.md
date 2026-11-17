# Charity Eats

**Fund the groceries a South African community kitchen needs, and see proof they arrived.**

Charity Eats connects donors with NGO-posted grocery needs. Donors choose specific items from a supplier's bulk catalogue, contribute toward a shared basket, and track the order through to a receipt photo and note from the NGO. The intended fulfilment model sends groceries directly from the supplier to the NGO.

## Why this matters

Food insecurity affects around **17.8 million people in South Africa** (estimate supplied in the hackathon brief; verify its source and date before public publication). NGOs and community kitchens often lack particular essentials, while donors may not know what to give or whether it arrived.

## What makes Charity Eats different

- **NGO-posted needs:** kitchens list what they are short of this week, such as maize meal, cooking oil, or baby formula. Donors fund those items instead of guessing.
- **Proof of delivery:** the NGO uploads a photo and short receipt note; donors can view both against their contribution.
- **Pooled donations:** several donors can contribute small amounts, such as **R50**, toward the same bulk basket until it is fully funded.

## Demo scope

This is a mobile-first, three-hour hackathon MVP for a five-person team. It demonstrates the donation and receipt loop; it does not transact money or arrange real deliveries.

| Available in the MVP | Demo behaviour |
| --- | --- |
| Browse NGOs and current needs | Five fictional South African NGO profiles with weekly grocery needs |
| Build a basket | Select requested catalogue items for one NGO and join its shared funding basket |
| Pooled funding | Choose an amount up to the remaining balance and see the funding progress update |
| Mock checkout and confirmation | A clearly labelled Pay button records a simulated paid contribution |
| Delivery tracking | See funding, order status, and the NGO's receipt photo and note |
| NGO workspace | Post needs, review funded orders, and confirm receipt with a photo |
| Demo role toggle | Switch between Donor and NGO views without authentication |

### Explicitly mocked

- **Payments:** “Pay (demo)” marks a contribution as paid. No gateway, card details, or money movement.
- **Notifications:** on-screen messages replace email and WhatsApp.
- **Supplier integration:** a static fake catalogue replaces supplier APIs. No order is sent to a supplier and no transport is booked.
- **NGO verification:** a registration-number field is stored for demonstration only. No verification checks occur; profiles display “Verification mocked”.

User accounts, tax certificates, multi-supplier routing, real payments, and an admin dashboard are out of scope.

## Fixed stack

- Next.js **App Router** with TypeScript
- Tailwind CSS; shadcn/ui is optional
- Supabase **Postgres** for application data and **Storage** for delivery photos
- Vercel deployment
- Mobile-first layouts

## Planned local setup

**This repository currently contains documentation only.** The commands and variables below are the implementation target, not a claim that the app or scripts already exist.

1. Create the Next.js App Router application in this repo with TypeScript and Tailwind CSS.
2. Create a disposable Supabase demo project, apply the schema and seed fixtures described in [SPEC.md](SPEC.md), and create the `delivery-proofs` Storage bucket.
3. Configure local environment variables in `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-public-anon-key>
   ```

4. Once the application and package scripts exist, run `npm install` and `npm run dev`, then open `http://localhost:3000`.
5. Deploy to Vercel with the same environment variables and verify the complete donation-to-proof flow on the deployed URL.

Keep secrets out of the repo. Public Supabase keys require explicit demo access policies; never expose a service-role key in browser code. Use fictional records and non-sensitive delivery photos in this unauthenticated demo.

## Three-minute demo

1. Open Donor view and choose **Ubuntu Table Community Kitchen** in Soweto.
2. Read its weekly need for maize meal and cooking oil, then add both to a basket worth **R550**.
3. Show the existing **R400** pooled funding. Contribute **R50** through mock checkout; confirmation shows **R450 / R550** and “Awaiting funding”.
4. Simulate another contribution of **R100** to fully fund the basket. Show the resulting order as “Awaiting delivery”.
5. Switch to NGO view, select Ubuntu Table, and confirm receipt with a photo and a short note.
6. Switch back to Donor view and open the first contribution's tracking screen to show “Delivered”, the photo, and the note.

## Team plan: five people, three hours

| Owner | Primary responsibility |
| --- | --- |
| 1 | App shell, role toggle, mobile layout, integration, Vercel deployment |
| 2 | Donor browsing, needs, basket, and contribution tracking screens |
| 3 | NGO needs form and delivery receipt/photo workflow |
| 4 | Supabase schema, seeds, pooled funding mutation, Storage wiring |
| 5 | Mock checkout, confirmation, manual QA, demo rehearsal |

Agree shared types and status names in the first 15 minutes. Build through minute 105, integrate and deploy by minute 140, then spend the final 40 minutes testing and rehearsing. Detailed checkpoints and acceptance criteria are in [SPEC.md](SPEC.md).

## After the hackathon

Add real authentication and access control, NGO verification, supplier fulfilment integration, a payment gateway such as PayFast or Paystack, and real notifications. These require additional design and are not part of this demo.
