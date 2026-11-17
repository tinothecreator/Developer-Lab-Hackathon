"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBasketForNgo } from "@/lib/services";
import { SHOWCASE_NGO_ID, QUICK_CONTRIBUTION_CENTS } from "@/lib/constants";
import { formatZar, parseRandToCents } from "@/lib/money";
import { useService } from "@/components/ui/useService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { FundingSummary } from "./FundingSummary";
import { BasketContents } from "./BasketContents";

const load = () => getBasketForNgo(SHOWCASE_NGO_ID);
export function BasketPage() {
  const { result, retry } = useService(load);
  const [amount, setAmount] = useState("50");
  const router = useRouter();
  if (!result) return <LoadingState />;
  if (!result.ok) return <ErrorState message={result.error.message} onRetry={retry} />;
  const view = result.data;
  const cents = parseRandToCents(amount);
  const message = cents === null ? "Enter a positive rand amount with at most two decimal places." : cents > view.remaining_cents ? "Choose an amount within the remaining balance." : null;
  function continueToCheckout(event: FormEvent) {
    event.preventDefault();
    if (cents === null || cents > view.remaining_cents) return;
    router.push(`/checkout?basketId=${view.basket.id}&amountCents=${cents}`);
  }
  return <div className="space-y-7"><Link className="text-link" href={`/ngos/${SHOWCASE_NGO_ID}`}>← Back to Ubuntu Table</Link><div><p className="eyebrow">A basket we fill together</p><h1 className="page-title mt-3">Ubuntu Table’s groceries</h1><p className="mt-4 text-[var(--muted)]">The contents are fixed. Your contribution helps fund them.</p></div>
    <div className="grid gap-6 md:grid-cols-2"><Card><h2 className="text-xl font-bold">Inside the basket</h2><BasketContents view={view} /><div className="mt-6 border-t border-[var(--border)] pt-6"><FundingSummary view={view} /></div></Card>
      <Card><h2 className="text-xl font-bold">Choose your contribution</h2>{view.remaining_cents <= 0 ? <p className="mt-4" role="status">This basket is fully funded. No further contributions are needed.</p> : <form onSubmit={continueToCheckout} className="mt-5 space-y-5" noValidate>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Contribution shortcuts">{QUICK_CONTRIBUTION_CENTS.map((value) => <Button key={value} disabled={value > view.remaining_cents} aria-pressed={cents === value} onClick={() => setAmount(String(value / 100))}>{formatZar(value)}</Button>)}<Button disabled={view.remaining_cents <= 0} aria-pressed={cents === view.remaining_cents} onClick={() => setAmount((view.remaining_cents / 100).toFixed(2))}>Fund remaining</Button></div>
        <div><label htmlFor="contribution-amount" className="mb-2 block text-sm font-bold">Your amount (ZAR)</label><input id="contribution-amount" inputMode="decimal" autoComplete="off" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={!!message} aria-describedby="amount-help amount-error" /><p id="amount-help" className="mt-2 text-xs text-[var(--muted)]">Any positive amount up to {formatZar(view.remaining_cents)}. No fees or rounding.</p><p id="amount-error" className="mt-2 text-sm text-red-800" aria-live="polite">{message}</p></div>
        <Button type="submit" className="w-full" disabled={!!message}>Continue to checkout →</Button><p className="text-xs leading-5 text-[var(--muted)]">Payment simulated (demo). No bank or card details are requested.</p>
      </form>}</Card></div>
  </div>;
}
