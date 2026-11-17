import type { BasketView } from "@/lib/types";
import { formatZar } from "@/lib/money";
import { getStatusLabel } from "@/lib/status";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

export function FundingSummary({ view }: { view: BasketView }) {
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge tone={view.order?.status === "delivered" ? "success" : "warning"}>{getStatusLabel(view.order)}</Badge><span className="text-xs text-[var(--muted)]">Delivery simulated (demo)</span></div>
    <div><p className="text-2xl font-extrabold tracking-tight">{formatZar(view.basket.funded_cents)} <span className="text-sm font-normal text-[var(--muted)]">of {formatZar(view.basket.target_cents)}</span></p><div className="mt-3"><ProgressBar value={view.basket.funded_cents} max={view.basket.target_cents} /></div></div>
    <p className="text-sm text-[var(--muted)]">{view.remaining_cents > 0 ? <><strong className="text-[var(--green)]">{formatZar(view.remaining_cents)}</strong> still needed to fill this basket.</> : "This basket is fully funded. Thank you for helping fill it."}</p>
  </div>;
}
