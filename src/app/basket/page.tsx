import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AmountPicker } from "@/app/basket/AmountPicker";
import { SHOWCASE_NGO_ID } from "@/lib/constants";
import { formatZar } from "@/lib/money";
import { getBasketForNgo } from "@/lib/services/baskets";

export default async function BasketPage({ searchParams }: PageProps<"/basket">) {
  const { ngoId = SHOWCASE_NGO_ID } = await searchParams;
  const selectedNgoId = Array.isArray(ngoId) ? ngoId[0] ?? SHOWCASE_NGO_ID : ngoId;
  const result = await getBasketForNgo(selectedNgoId);
  if (!result.ok) return <ErrorMessage message={result.error.message} />;
  const { basket, ngo, items, remaining_cents: remainingCents } = result.data;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/ngos/${ngo.id}`} className="font-semibold text-emerald-900 underline underline-offset-4">← Back to {ngo.name}</Link>
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Fixed showcase basket</p>
        <h1 className="mt-2 text-3xl font-bold">{ngo.name}</h1>
        <p className="mt-1 text-stone-600">Supplier fulfilment simulated (demo) · Free delivery</p>
        <ul className="mt-6 divide-y divide-stone-200">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-2 py-4">
              <span>{item.quantity_packs} × {item.catalogue_item.name} <span className="text-stone-600">({item.catalogue_item.pack_label})</span></span>
              <span className="font-semibold">{formatZar(item.quantity_packs * item.unit_price_cents)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3 rounded-xl bg-stone-50 p-4">
          <ProgressBar fundedCents={basket.funded_cents} targetCents={basket.target_cents} />
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <p><span className="block text-stone-500">Funded</span><strong>{formatZar(basket.funded_cents)}</strong></p>
            <p><span className="block text-stone-500">Target</span><strong>{formatZar(basket.target_cents)}</strong></p>
            <p className="col-span-2 sm:col-span-1"><span className="block text-stone-500">Remaining</span><strong>{formatZar(remainingCents)}</strong></p>
          </div>
        </div>
        {basket.status === "funding" ? (
          <div className="mt-6"><AmountPicker basketId={basket.id} ngoId={ngo.id} remainingCents={remainingCents} /></div>
        ) : (
          <p className="mt-5 font-semibold">This basket is fully funded and cannot accept contributions.</p>
        )}
      </Card>
    </div>
  );
}
