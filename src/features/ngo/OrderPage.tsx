"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { getOrderView } from "@/lib/services";
import { getStatusLabel } from "@/lib/status";
import { useService } from "@/components/ui/useService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { BasketContents } from "@/features/donor/BasketContents";
import { ReceiptEvidence } from "@/features/donor/ReceiptEvidence";
import { ReceiptForm } from "./ReceiptForm";

export function OrderPage({ orderId }: { orderId: string }) {
  const load = useCallback(() => getOrderView(orderId), [orderId]);
  const { result, retry } = useService(load);
  const [confirmed, setConfirmed] = useState(false);
  if (!result) return <LoadingState />;
  if (!result.ok) return <ErrorMessage message={result.error.message} onRetry={retry} />;
  const { order, basket_view: view } = result.data;
  return <div className="space-y-7"><Link className="text-link" href="/ngo">← Funded orders</Link><div><p className="eyebrow">From the shared basket to your kitchen</p><h1 className="page-title mt-3">{view.ngo.name}’s order</h1><div className="mt-5 flex flex-wrap items-center gap-3"><Badge tone={order.status === "delivered" ? "success" : "warning"}>{getStatusLabel(order)}</Badge><span className="text-xs text-[var(--muted)]">Delivery simulated (demo)</span></div></div>
    {confirmed && order.status === "delivered" && <Toast>Simulated receipt saved. Donors can now see your photo and note. No real notification was sent.</Toast>}
    <div className="grid items-start gap-6 md:grid-cols-2"><Card><h2 className="text-xl font-bold">Funded groceries</h2><BasketContents view={view} /><p className="mt-5 text-xs text-[var(--muted)]">Order reference: {order.id}</p></Card><Card>{order.status === "delivered" ? <ReceiptEvidence key={order.proof_photo_path} order={order} ngoName={view.ngo.name} /> : <ReceiptForm key={order.id} order={order} onDelivered={() => { setConfirmed(true); retry(); }} />}</Card></div>
  </div>;
}
