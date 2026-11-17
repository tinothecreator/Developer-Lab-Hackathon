"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getFundedOrdersForNgo } from "@/lib/services";
import { getStatusLabel } from "@/lib/status";
import { useDemoRole } from "@/components/shell/RoleProvider";
import { useService } from "@/components/ui/useService";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";

export function NgoWorkspace() {
  const { selectedNgoId } = useDemoRole();
  const load = useCallback(() => getFundedOrdersForNgo(selectedNgoId), [selectedNgoId]);
  const { result, retry } = useService(load);
  return <div className="space-y-7"><div><p className="eyebrow">The kitchen workspace</p><h1 className="page-title mt-3">Funded grocery orders</h1><p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">When a basket is fully funded, its order appears here. Add a non-sensitive demo photo and receipt note to close the loop.</p></div><p className="text-xs text-[var(--muted)]">Supplier fulfilment simulated (demo) · Delivery simulated (demo)</p>
    {!result ? <LoadingState /> : !result.ok ? <ErrorMessage message={result.error.message} onRetry={retry} /> : result.data.length === 0 ? <EmptyState title="No funded orders yet">An order is created only after a basket is fully funded. Partially funded baskets have no receipt action.</EmptyState> : <ul className="space-y-4">{result.data.map((order) => <li key={order.id}><Card><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Grocery order</h2><Badge tone={order.status === "delivered" ? "success" : "warning"}>{getStatusLabel(order)}</Badge></div><p className="mt-3 text-xs text-[var(--muted)]">{order.id}</p><Link href={`/ngo/orders/${order.id}`} className="text-link mt-3">{order.status === "delivered" ? "View receipt" : "Open order and confirm receipt"} →</Link><p className="text-xs text-[var(--muted)]">Delivery simulated (demo)</p></Card></li>)}</ul>}
    <button type="button" className="text-link" onClick={retry}>Refresh orders</button>
  </div>;
}
