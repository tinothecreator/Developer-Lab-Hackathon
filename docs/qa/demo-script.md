# Three-minute demo

Preparation: rerun `supabase/seed.sql`, open `/` in Donor view at 360 px, and keep a non-sensitive grocery photo ≤5 MB ready. All organisations are fictional. Keep the first R50 tracking URL in a separate tab.

| Time | Presenter action and narration |
| --- | --- |
| 0:00–0:25 | Open Ubuntu Table. “This fictional kitchen needs two maize packs and one oil pack. Verification is mocked for this demo.” |
| 0:25–0:45 | Join the fixed R550 basket. Show R400 already funded and R150 remaining. “A small contribution joins the shared pool.” |
| 0:45–1:10 | Choose R50, continue, press **Pay (demo)**. Show saved confirmation at R450. “This is a simulated payment, with no card details.” Open tracking and retain its URL. |
| 1:10–1:35 | Return to basket, choose R100 and pay. Show R550 and Awaiting delivery. “Full funding creates one local demo order. Supplier fulfilment is simulated.” |
| 1:35–2:15 | Toggle NGO, select Ubuntu Table, open the funded order. Select the prepared photo and write “Demo groceries received: two maize bags and one oil bottle.” Confirm receipt. Explain that upload finishes before the saved delivery status. |
| 2:15–2:45 | Return to Donor view and open the first R50 tracking URL. Show Delivered, photo, note and SAST timestamp. Reload to show persistence. “Every contributor sees the same receipt.” |
| 2:45–3:00 | “Payments, notifications, supplier fulfilment, verification and delivery are visibly simulated. The demo uses Supabase persistence and Storage; it has no authentication.” |

If a service fails, show the honest retry state. Never narrate success before persistence or substitute local fixture success. Reset through SQL Editor before the next rehearsal.
