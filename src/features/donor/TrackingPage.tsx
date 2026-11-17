"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getContributionTracking } from "@/lib/services";
import { formatZar } from "@/lib/money";
import { useService } from "@/components/ui/useService";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { FundingSummary } from "./FundingSummary";
import { BasketContents } from "./BasketContents";
import { ReceiptEvidence } from "./ReceiptEvidence";

export function TrackingPage({ contributionId }: { contributionId: string }) {
  const load = useCallback(() => getContributionTracking(contributionId), [contributionId]);
  const { result, retry } = useService(load);
  if (!result) return <LoadingState />;
  if (!result.ok) return <ErrorState message={result.error.message} onRetry={retry} />;
  const { contribution, basket_view: view } = result.data;
  return <div className="space-y-7"><Link className="text-link" href="/">← Donor home</Link><div><p className="eyebrow">Follow your contribution</p><h1 className="page-title mt-3">A little help. A shared basket.</h1><p className="mt-4 text-[var(--muted)]">Your {formatZar(contribution.amount_cents)} simulated contribution supports {view.ngo.name}.</p></div><div className="grid gap-6 md:grid-cols-2"><Card><h2 className="mb-5 text-xl font-bold">The latest from the basket</h2><FundingSummary view={view} /><button onClick={retry} className="text-link mt-3" type="button">Refresh status</button><p className="mt-2 text-xs text-[var(--muted)]">Contribution reference: {contribution.id}</p></Card><Card><h2 className="text-xl font-bold">What you’re helping fund</h2><BasketContents view={view} /></Card></div>{view.order?.status === "delivered" && <Card><ReceiptEvidence key={view.order.proof_photo_path} order={view.order} ngoName={view.ngo.name} /></Card>}</div>;
}
