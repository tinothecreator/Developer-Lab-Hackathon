import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getProofUrl } from "@/lib/services/storage";
import { getContributionTracking } from "@/lib/services/contributions";
import { formatZar } from "@/lib/money";

export default async function ContributionTrackingPage({ params }: PageProps<"/donations/[contributionId]">) {
  const { contributionId } = await params;
  const result = await getContributionTracking(contributionId);
  if (!result.ok && result.error.message.includes("not found")) notFound();
  if (!result.ok) return <ErrorMessage message={result.error.message} />;
  const { contribution, basket_view: view } = result.data;
  const deliveryStatus = !view.order ? "Awaiting funding" : view.order.status === "delivered" ? "Delivered" : "Awaiting delivery";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/ngos/${view.ngo.id}`} className="font-semibold text-emerald-900 underline underline-offset-4">← {view.ngo.name}</Link>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold">Your contribution</h1>
          <Badge>{deliveryStatus}</Badge>
        </div>
        <p className="text-stone-700">Delivery simulated (demo)</p>
        <p>You contributed <strong>{formatZar(contribution.amount_cents)}</strong> to {view.ngo.name}.</p>
        <ProgressBar fundedCents={view.basket.funded_cents} targetCents={view.basket.target_cents} />
        <p>{formatZar(view.basket.funded_cents)} raised of {formatZar(view.basket.target_cents)}</p>
        <ul className="list-inside list-disc text-stone-700">
          {view.items.map((item) => <li key={item.id}>{item.quantity_packs} × {item.catalogue_item.name} ({item.catalogue_item.pack_label})</li>)}
        </ul>
      </Card>
      {view.order?.status === "delivered" && view.order.proof_photo_path && (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold">Receipt evidence</h2>
          <Image
            className="max-h-[28rem] w-full rounded-xl object-contain"
            src={getProofUrl(view.order.proof_photo_path)}
            alt={`Delivery proof for ${view.ngo.name}'s grocery basket`}
            width={1200}
            height={900}
            unoptimized
          />
          <p className="text-stone-700">{view.order.receipt_note}</p>
          {view.order.delivered_at && <time dateTime={view.order.delivered_at} className="text-sm text-stone-600">{new Date(view.order.delivered_at).toLocaleString("en-ZA")}</time>}
        </Card>
      )}
    </div>
  );
}
