import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getBasketForNgo } from "@/lib/services/baskets";
import { getNeedsForNgo } from "@/lib/services/needs";
import { getNgoById } from "@/lib/services/ngos";
import { formatZar } from "@/lib/money";

export default async function NgoProfilePage({ params }: PageProps<"/ngos/[id]">) {
  const { id } = await params;
  const [ngoResult, needsResult, basketResult] = await Promise.all([
    getNgoById(id),
    getNeedsForNgo(id),
    getBasketForNgo(id),
  ]);
  if (!ngoResult.ok && ngoResult.error.message.includes("not found")) notFound();
  if (!ngoResult.ok) return <ErrorMessage message={ngoResult.error.message} />;
  if (!needsResult.ok) return <ErrorMessage message={needsResult.error.message} />;
  const ngo = ngoResult.data;

  return (
    <div className="space-y-6">
      <Link href="/" className="font-semibold text-emerald-900 underline underline-offset-4">← All demo support</Link>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">{ngo.city}, {ngo.province}</p>
            <h1 className="mt-2 text-3xl font-bold">{ngo.name}</h1>
          </div>
          <Badge>Verification mocked (demo)</Badge>
        </div>
        <p className="text-stone-700">{ngo.mission}</p>
        <p className="text-sm text-stone-500">Fictional demo registration: {ngo.registration_number}</p>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">This week’s grocery needs</h2>
          <p className="mt-1 text-stone-600">Pack prices are illustrative demo prices from a fictional supplier.</p>
        </div>
        {needsResult.data.length === 0 ? <EmptyState>No open grocery needs for this NGO right now.</EmptyState> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {needsResult.data.map((need) => (
              <Card key={need.id}>
                <h3 className="font-bold">{need.catalogue_item.name}</h3>
                <p className="mt-1 text-stone-600">{need.quantity_packs} × {need.catalogue_item.pack_label}</p>
                <p className="mt-3 font-semibold">{formatZar(need.catalogue_item.price_cents)} / pack</p>
                <p className="mt-2 text-sm text-stone-600">{need.note}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {basketResult.ok && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Shared grocery basket</h2>
              <p className="mt-1 text-sm text-stone-600">Supplier fulfilment simulated (demo)</p>
            </div>
            <Badge>{basketResult.data.order ? "Funded" : "Open for contributions"}</Badge>
          </div>
          <ProgressBar fundedCents={basketResult.data.basket.funded_cents} targetCents={basketResult.data.basket.target_cents} />
          <p className="text-stone-700">
            {formatZar(basketResult.data.basket.funded_cents)} raised of {formatZar(basketResult.data.basket.target_cents)}
          </p>
          <Link href={`/basket?ngoId=${encodeURIComponent(ngo.id)}`}>
            <Button type="button">Join this basket</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
