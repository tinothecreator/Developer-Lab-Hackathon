import { TrackingPage } from "@/features/donor/TrackingPage";
export default async function Page({ params }: { params: Promise<{ contributionId: string }> }) {
  const { contributionId } = await params;
  return <TrackingPage contributionId={contributionId} />;
}
