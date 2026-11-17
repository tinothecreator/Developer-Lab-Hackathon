"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBasketForNgo, submitContribution } from "@/lib/services";
import { DEMO_DONOR_ID, SHOWCASE_NGO_ID, SHOWCASE_BASKET_ID } from "@/lib/constants";
import { formatZar } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { useService } from "@/components/ui/useService";
import { FundingSummary } from "@/features/donor/FundingSummary";
import { BasketContents } from "@/features/donor/BasketContents";
import { getAttemptKey, getAttemptSnapshot, getServerAttemptSnapshot, subscribeAttempt, isSubmittedAttempt, markAttemptSubmitted } from "./attempt";

const load = () => getBasketForNgo(SHOWCASE_NGO_ID);
export function CheckoutPage({ basketId, amountText }: { basketId: string; amountText: string }) {
  const amountCents = /^\d+$/.test(amountText) ? Number(amountText) : NaN;
  const isValid = basketId === SHOWCASE_BASKET_ID && Number.isSafeInteger(amountCents) && amountCents > 0 && amountCents <= 2147483647;
  const { result, retry } = useService(load);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptSnapshot = useSyncExternalStore(subscribeAttempt, getAttemptSnapshot, getServerAttemptSnapshot);
  const allowReplay = isSubmittedAttempt(attemptSnapshot, basketId, amountCents);
  const keyRef = useRef<string | null>(null);
  const submitting = useRef(false);
  const router = useRouter();
  useEffect(() => { if (isValid) keyRef.current = getAttemptKey(basketId, amountCents); }, [basketId, amountCents, isValid]);
  async function pay() {
    if (!isValid || submitting.current || !result?.ok) return;
    submitting.current = true;
    setPending(true);
    setError(null);
    keyRef.current ??= getAttemptKey(basketId, amountCents);
    markAttemptSubmitted(keyRef.current, true);
    try {
      const response = await submitContribution({ basketId, demoDonorId: DEMO_DONOR_ID, amountCents, checkoutKey: keyRef.current });
      if (!response.ok) {
        setError(response.error.message);
        markAttemptSubmitted(keyRef.current, response.error.code === "UNKNOWN");
        retry();
        return;
      }
      router.push(`/confirmation/${response.data.contribution_id}`);
      router.refresh();
    } finally { submitting.current = false; setPending(false); }
  }
  if (!isValid) return <div className="space-y-4"><ErrorMessage message="Choose a valid contribution amount from the basket first." /><Link className="text-link" href="/basket">Return to basket</Link></div>;
  return <div className="space-y-7"><Link className="text-link" href="/basket">← Change amount</Link><div><p className="eyebrow">One small step for a fuller table</p><h1 className="page-title mt-3">Your contribution</h1><p className="mt-4 text-[var(--muted)]">This checkout is a simulation (demo). No money will be charged.</p></div>
    {error && <ErrorMessage message={error} />}
    {!result ? <LoadingState label="Refreshing the basket balance…" /> : !result.ok ? <ErrorMessage message={result.error.message} onRetry={retry} /> : <div className="grid gap-6 md:grid-cols-2"><Card><h2 className="text-xl font-bold">{result.data.ngo.name}</h2><BasketContents view={result.data} /><div className="mt-6"><FundingSummary view={result.data} /></div></Card>
      <Card className="space-y-5"><h2 className="text-xl font-bold">Contribution summary</h2><dl className="space-y-4"><div className="flex justify-between gap-3"><dt>Your contribution</dt><dd className="font-bold">{formatZar(amountCents)}</dd></div><div className="flex justify-between gap-3 text-sm text-[var(--muted)]"><dt>Delivery (demo)</dt><dd>Free</dd></div><div className="flex justify-between gap-3 border-t border-[var(--border)] pt-4"><dt className="font-bold">Total (demo)</dt><dd className="text-2xl font-extrabold">{formatZar(amountCents)}</dd></div></dl>
        {amountCents > result.data.remaining_cents && !allowReplay && <ErrorMessage message="The remaining balance has changed. Return to the basket and choose a new amount." />}
        <Button onClick={pay} className="w-full" disabled={pending || (!allowReplay && amountCents > result.data.remaining_cents)}>{pending ? "Recording payment (demo)…" : allowReplay ? "Retry Pay (demo)" : "Pay (demo)"}</Button>
        <p className="text-xs leading-6 text-[var(--muted)]">Payment simulated (demo). This records a demo contribution only. No real payment, bank details or card details.</p><p role="status" className="text-xs text-[var(--muted)]">{pending ? "Please wait. Your checkout key is kept if this request needs a retry." : "Retries use the same checkout key to prevent duplicates."}</p>
      </Card></div>}
  </div>;
}
