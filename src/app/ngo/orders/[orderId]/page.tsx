import { OrderPage } from "@/features/ngo/OrderPage";
export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderPage key={orderId} orderId={orderId} />;
}
