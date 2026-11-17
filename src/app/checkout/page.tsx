import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import { SHOWCASE_NGO_ID } from "@/lib/constants";
import { formatZar } from "@/lib/money";
import { getBasketForNgo } from "@/lib/services/baskets";

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const query = await searchParams;
  const basketId = Array.isArray(query.basketId) ? query.basketId[0] : query.basketId;
  const ngoIdValue = Array.isArray(query.ngoId) ? query.ngoId[0] : query.ngoId;
  const ngoId = ngoIdValue || SHOWCASE_NGO_ID;
  const amountValue = Array.isArray(query.amountCents) ? query.amountCents[0] : query.amountCents;
  const amountCents = amountValue && /^\d+$/.test(amountValue) ? Number(amountValue) : 0;
  if (!basketId || !Number.isSafeInteger(amountCents) || amountCents <= 0) {
    return <ErrorMessage message="Checkout details are missing or invalid. Return to the basket and choose a valid amount." />;
  }
  const result = await getBasketForNgo(ngoId);
  if (!result.ok) return <ErrorMessage message={result.error.message} />;
  if (result.data.basket.id !== basketId) return <ErrorMessage message="This basket is no longer available. Return to the basket to refresh." />;
  if (amountCents > result.data.remaining_cents) return <ErrorMessage message={`This amount exceeds the remaining ${formatZar(result.data.remaining_cents)}. Return to the basket and choose again.`} />;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href={`/basket?ngoId=${encodeURIComponent(ngoId)}`} className="font-semibold text-emerald-900 underline underline-offset-4">← Back to basket</Link>
      <Card className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Checkout · demo</p>
          <h1 className="mt-2 text-3xl font-bold">Confirm your contribution</h1>
        </div>
        <dl className="space-y-3">
          <div className="flex justify-between gap-4"><dt className="text-stone-600">NGO</dt><dd className="text-right font-semibold">{result.data.ngo.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-600">Basket</dt><dd className="text-right font-semibold">{result.data.items.length} grocery items · {formatZar(result.data.basket.target_cents)} target</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-600">Contribution</dt><dd className="text-right text-lg font-bold">{formatZar(amountCents)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-600">Delivery</dt><dd className="text-right font-semibold">Free (demo)</dd></div>
        </dl>
        <CheckoutForm
          key={`${basketId}:${amountCents}`}
          basketId={basketId}
          ngoId={ngoId}
          amountCents={amountCents}
          remainingCents={result.data.remaining_cents}
        />
      </Card>
    </div>
  );
}
