import { NgoProfile } from "@/features/donor/NgoProfile";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NgoProfile id={id} />;
}
