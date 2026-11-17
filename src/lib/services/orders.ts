import type { Basket, BasketView, DeliveryInput, Order, Result } from "../types";
import { receiptNoteSchema } from "../validation";
import { withClient, success, databaseFailure, failure } from "./result";
import { loadBasketView } from "./baskets";

export async function getFundedOrdersForNgo(ngoId: string): Promise<Result<Order[]>> {
  return withClient(async (client) => {
    const { data, error } = await client.from("orders").select("*, baskets!inner(ngo_id)").eq("baskets.ngo_id", ngoId).order("created_at", { ascending: false }).returns<Order[]>();
    return error ? databaseFailure(error) : success(data ?? []);
  });
}
export async function getOrderView(orderId: string): Promise<Result<{ order: Order; basket_view: BasketView }>> {
  return withClient(async (client) => {
    const order = await client.from("orders").select("*").eq("id", orderId).maybeSingle<Order>();
    if (order.error) return databaseFailure(order.error);
    if (!order.data) return failure("UNKNOWN", "This funded order was not found.");
    const basket = await client.from("baskets").select("*").eq("id", order.data.basket_id).single<Basket>();
    if (basket.error) return databaseFailure(basket.error);
    const view = await loadBasketView(client, basket.data);
    return view.ok ? success({ order: order.data, basket_view: view.data }) : view;
  });
}
export async function confirmDelivery({ orderId, proofPath, note }: DeliveryInput): Promise<Result<Order>> {
  const parsed = receiptNoteSchema.safeParse(note);
  if (!parsed.success) return failure("UNKNOWN", "Write a receipt note of 1–280 characters.");
  return withClient(async (client) => {
    const { data, error } = await client.rpc("confirm_delivery", { p_order_id: orderId, p_proof_path: proofPath, p_note: parsed.data });
    if (error) return databaseFailure(error);
    return data?.id === orderId && data?.status === "delivered" && data.proof_photo_path === proofPath
      ? success(data as Order) : failure("UNKNOWN", "The receipt response was uncertain. Keep this form and retry to check its saved result.");
  });
}
