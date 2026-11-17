import type { BasketView } from "@/lib/types";
import { formatZar } from "@/lib/money";

export function BasketContents({ view }: { view: BasketView }) {
  return <div>
    <ul className="divide-y divide-[var(--border)]">{view.items.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0"><p className="font-bold">{item.quantity_packs} × {item.catalogue_item.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.catalogue_item.pack_label} · {formatZar(item.unit_price_cents)} per pack</p></div>
      <p className="shrink-0 text-sm font-semibold">{formatZar(item.quantity_packs * item.unit_price_cents)}</p>
    </li>)}</ul>
    {view.items.length === 0 && <p className="py-4 text-sm">No grocery items found.</p>}
    <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Fixed grocery contents · Mzansi Bulk Foods (fictional supplier)<br />Supplier fulfilment simulated (demo) · Free delivery (demo)</p>
  </div>;
}
