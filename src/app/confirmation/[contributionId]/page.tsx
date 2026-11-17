import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";
import { formatZar } from "@/lib/money";
import { getContributionTracking } from "@/lib/services/contributions";
import { getDeliveryStatusLabel } from "@/lib/status";

export default async function ConfirmationPage({ params }: PageProps<"/confirmation/[contributionId]">) {
  const { contributionId } = await params;
  const result = await getContributionTracking(contributionId);
  if (!result.ok && result.error.message.includes("not found")) notFound();
  if (!result.ok) return <ErrorMessage message={result.error.message} />;
  const { contribution, basket_view: view } = result.data;
  const status = getDeliveryStatusLabel(view.order);

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Card className="space-y-5">
        <Badge>Simulated payment success</Badge>
        <h1 className="text-3xl font-bold">Thank you for backing {view.ngo.name}</h1>
        <p>Your demo contribution of <strong>{formatZar(contribution.amount_cents)}</strong> has been recorded.</p>
        <Toast tone="info">Notification (demo): this confirmation is shown here only.</Toast>
        <div className="space-y-3">
          <div className="flex justify-between gap-3"><span>Basket progress</span><strong>{formatZar(view.basket.funded_cents)} / {formatZar(view.basket.target_cents)}</strong></div>
          <ProgressBar fundedCents={view.basket.funded_cents} targetCents={view.basket.target_cents} />
          <p className="text-sm text-stone-700">Status: {status}</p>
        </div>
        <Link href={`/donations/${contribution.id}`} className="inline-flex min-h-11 items-center font-semibold text-emerald-900 underline underline-offset-4">Track this contribution</Link>
      </Card>
    </div>
  );
}
