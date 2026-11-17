import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReceiptForm } from "@/features/ngo/ReceiptForm";
import { formatZar } from "@/lib/money";
import { getOrderView } from "@/lib/services/orders";
import { getProofUrl } from "@/lib/services/storage";

export default async function OrderPage({ params }: PageProps<"/ngo/orders/[orderId]">) {
  const { orderId } = await params;
  const result = await getOrderView(orderId);
  if (!result.ok && result.error.message.includes("not found")) notFound();
  if (!result.ok) return <ErrorMessage message={result.error.message} />;
  const { order, basket_view: view } = result.data;
  const isAwaitingDelivery = order.status === "awaiting_delivery";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/ngo" className="font-semibold text-emerald-900 underline underline-offset-4">← Funded orders</Link>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">{view.ngo.name}</p>
            <h1 className="mt-2 text-3xl font-bold">Grocery order</h1>
          </div>
          <Badge>{isAwaitingDelivery ? "Awaiting delivery" : "Delivered"}</Badge>
        </div>
        <p className="text-stone-700">Delivery simulated (demo)</p>
        <ul className="list-inside list-disc divide-y divide-stone-200">
          {view.items.map((item) => (
            <li key={item.id} className="py-3">{item.quantity_packs} × {item.catalogue_item.name} ({item.catalogue_item.pack_label}) · {formatZar(item.quantity_packs * item.unit_price_cents)}</li>
          ))}
        </ul>
        <p className="font-semibold">Basket total: {formatZar(view.basket.target_cents)}</p>
      </Card>

      {isAwaitingDelivery ? (
        <Card className="space-y-4">
          <h2 className="text-xl font-bold">Confirm simulated receipt</h2>
          <p className="text-sm text-stone-600">Upload a non-sensitive demo photo and add a short note. The photo is saved before delivery status changes.</p>
          <ReceiptForm orderId={order.id} />
        </Card>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-xl font-bold">Receipt evidence</h2>
          {order.proof_photo_path && (
            <Image
              src={getProofUrl(order.proof_photo_path)}
              alt={`Delivery proof for ${view.ngo.name}'s grocery basket`}
              width={1200}
              height={900}
              unoptimized
              className="max-h-[28rem] w-full rounded-xl object-contain"
            />
          )}
          <p>{order.receipt_note}</p>
          {order.delivered_at && <time dateTime={order.delivered_at} className="text-sm text-stone-600">{new Date(order.delivered_at).toLocaleString("en-ZA")}</time>}
        </Card>
      )}
    </div>
  );
}
