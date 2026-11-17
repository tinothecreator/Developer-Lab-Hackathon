"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { DEMO_DONOR_ID } from "@/lib/constants";
import { formatZar } from "@/lib/money";
import { submitContribution } from "@/lib/services/contributions";
import { getBasketForNgo } from "@/lib/services/baskets";

type Props = {
  basketId: string;
  ngoId: string;
  amountCents: number;
  remainingCents: number;
};

type Attempt = { amountCents: number; checkoutKey: string };

export function CheckoutForm({ basketId, ngoId, amountCents, remainingCents: initialRemaining }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [remainingCents, setRemainingCents] = useState(initialRemaining);
  const requestInFlight = useRef(false);
  const router = useRouter();
  const attemptStorageKey = `charity-eats-checkout:${basketId}`;

  function getAttemptKey(): string {
    const saved = window.sessionStorage.getItem(attemptStorageKey);
    if (saved) {
      try {
        const attempt = JSON.parse(saved) as Attempt;
        if (attempt.amountCents === amountCents && attempt.checkoutKey) return attempt.checkoutKey;
      } catch {
        window.sessionStorage.removeItem(attemptStorageKey);
      }
    }
    const checkoutKey = crypto.randomUUID();
    window.sessionStorage.setItem(attemptStorageKey, JSON.stringify({ amountCents, checkoutKey } satisfies Attempt));
    return checkoutKey;
  }

  async function pay() {
    if (requestInFlight.current || amountCents > remainingCents) return;
    requestInFlight.current = true;
    setIsSubmitting(true);
    setMessage("");
    const checkoutKey = getAttemptKey();
    const result = await submitContribution({ basketId, demoDonorId: DEMO_DONOR_ID, amountCents, checkoutKey });
    if (result.ok) {
      window.sessionStorage.removeItem(attemptStorageKey);
      router.push(`/confirmation/${result.data.contribution_id}`);
      return;
    }
    setMessage(result.error.message);
    const refreshed = await getBasketForNgo(ngoId);
    if (refreshed.ok) setRemainingCents(refreshed.data.remaining_cents);
    requestInFlight.current = false;
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <Toast tone="info">Pay (demo): no payment credentials are collected and no real payment is made.</Toast>
      {message && <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950" role="alert">{message} Remaining balance: {formatZar(remainingCents)}.</p>}
      <Button type="button" className="w-full" disabled={isSubmitting || amountCents > remainingCents || remainingCents <= 0} onClick={pay}>
        {isSubmitting ? "Submitting…" : `Pay (demo) · ${formatZar(amountCents)}`}
      </Button>
      {amountCents > remainingCents && <p className="text-sm text-red-800">This amount is now above the remaining {formatZar(remainingCents)}. Return to the basket and choose again.</p>}
    </div>
  );
}
