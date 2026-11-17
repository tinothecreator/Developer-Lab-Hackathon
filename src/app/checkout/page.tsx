import { CheckoutPage } from "@/features/checkout/CheckoutPage";
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const basketId = typeof query.basketId === "string" ? query.basketId : "";
  const amountText = typeof query.amountCents === "string" ? query.amountCents : "";
  return <CheckoutPage key={`${basketId}:${amountText}`} basketId={basketId} amountText={amountText} />;
}
