"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getNgoById, getNeedsForNgo, getBasketForNgo } from "@/lib/services";
import { SHOWCASE_NGO_ID } from "@/lib/constants";
import { formatZar } from "@/lib/money";
import { useService } from "@/components/ui/useService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FundingSummary } from "./FundingSummary";

export function NgoProfile({ id }: { id: string }) {
  const load = useCallback(async () => {
    const [ngo, needs, basket] = await Promise.all([getNgoById(id), getNeedsForNgo(id), getBasketForNgo(id)]);
    if (!ngo.ok) return ngo;
    if (!needs.ok) return needs;
    if (!basket.ok) return basket;
    return { ok: true as const, data: { ngo: ngo.data, needs: needs.data, basket: basket.data } };
  }, [id]);
  const { result, retry } = useService(load);
  if (id !== SHOWCASE_NGO_ID) return <EmptyState title="The demo follows Ubuntu Table"><Link className="text-link" href={`/ngos/${SHOWCASE_NGO_ID}`}>Open the showcase kitchen</Link></EmptyState>;
  if (!result) return <LoadingState />;
  if (!result.ok) return <ErrorState message={result.error.message} onRetry={retry} />;
  const { ngo, needs, basket } = result.data;
  return <div className="space-y-7"><Link className="text-link" href="/">← All demo baskets</Link><section><p className="eyebrow">Meet the kitchen</p><h1 className="page-title mt-3">{ngo.name}</h1><p className="mt-3 text-[var(--muted)]">{ngo.city}, {ngo.province}</p><p className="mt-4 max-w-xl leading-7">{ngo.mission}.</p><div className="mt-4"><Badge tone="success">Verification mocked (demo)</Badge><p className="mt-2 text-xs text-[var(--muted)]">Fictional registration: {ngo.registration_number}</p></div></section>
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]"><Card><h2 className="text-xl font-bold">This week’s seeded needs</h2><p className="mt-1 text-xs text-[var(--muted)]">Week of 16 November 2026 · Fictional demo needs</p>{needs.length === 0 ? <p className="mt-5">No seeded needs available.</p> : <ul className="mt-3 divide-y divide-[var(--border)]">{needs.map((need) => <li key={need.id} className="py-4"><p className="font-bold">{need.quantity_packs} × {need.catalogue_item.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{need.catalogue_item.pack_label} · {formatZar(need.catalogue_item.price_cents)} per pack</p><p className="mt-2 text-xs text-[var(--muted)]">{need.note}</p></li>)}</ul>}<p className="mt-3 text-xs text-[var(--muted)]">Mzansi Bulk Foods (fictional supplier)</p></Card>
      <Card className="space-y-5"><h2 className="text-xl font-bold">Fill the shared basket</h2><FundingSummary view={basket} /><Link href="/basket" className={`${buttonClassName} w-full`}>{basket.remaining_cents > 0 ? "Join basket" : "View funded basket"}</Link><p className="text-xs text-[var(--muted)]">Fixed contents · Free delivery (demo)<br />Supplier fulfilment simulated (demo)</p></Card></div>
  </div>;
}
