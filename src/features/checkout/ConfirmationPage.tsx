"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getContributionTracking } from "@/lib/services";
import { formatZar } from "@/lib/money";
import { Card } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { buttonClassName } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { useService } from "@/components/ui/useService";
import { FundingSummary } from "@/features/donor/FundingSummary";

export function ConfirmationPage({ contributionId }: { contributionId: string }) {
  const load = useCallback(() => getContributionTracking(contributionId), [contributionId]);
  const { result, retry } = useService(load);
  if (!result) return <LoadingState label="Checking your saved contribution…" />;
  if (!result.ok) return <ErrorMessage message={result.error.message} onRetry={retry} />;
  const { contribution, basket_view: view } = result.data;
  return <div className="mx-auto max-w-xl space-y-7"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-[var(--green)]" aria-hidden="true">✓</div><div><p className="eyebrow">Thank you for showing up</p><h1 className="page-title mt-3">Simulated payment success</h1><p className="mt-4 leading-7 text-[var(--muted)]">Your {formatZar(contribution.amount_cents)} demo contribution to {view.ngo.name} is saved. No real payment was taken.</p></div><Toast>Your simulated contribution is recorded. No real notification was sent.</Toast><Card><FundingSummary view={view} /><p className="mt-5 text-xs text-[var(--muted)]">Supplier fulfilment simulated (demo)</p></Card><Link className={`${buttonClassName} w-full`} href={`/donations/${contribution.id}`}>Track this contribution →</Link>{view.remaining_cents > 0 && <Link className="text-link" href="/basket">Return to the shared basket</Link>}<p className="text-xs text-[var(--muted)]">Contribution reference: {contribution.id}</p></div>;
}
