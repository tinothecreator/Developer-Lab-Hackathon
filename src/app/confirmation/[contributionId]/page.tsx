import { ConfirmationPage } from "@/features/checkout/ConfirmationPage";
export default async function Page({ params }: { params: Promise<{ contributionId: string }> }) {
  const { contributionId } = await params;
  return <ConfirmationPage contributionId={contributionId} />;
}
