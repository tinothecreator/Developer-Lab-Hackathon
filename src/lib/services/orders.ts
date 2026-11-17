import type { Order, Result } from "@/lib/types";
import { receiptNoteSchema } from "@/lib/validation";
import { fail, getSupabaseClient, mapServiceError, succeed, unavailable } from "@/lib/services/shared";
import { getBasketForNgo } from "@/lib/services/baskets";

export async function getFundedOrdersForNgo(ngoId: string): Promise<Result<Order[]>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data: baskets, error: basketError } = await supabase.from("baskets").select("id").eq("ngo_id", ngoId);
  if (basketError) return fail("UNKNOWN", "Orders could not be loaded. Please retry.");
  if (!baskets.length) return succeed([]);
  const { data: orders, error } = await supabase.from("orders").select("*")
    .in("basket_id", baskets.map((basket) => basket.id)).order("created_at", { ascending: false });
  if (error) return fail("UNKNOWN", "Orders could not be loaded. Please retry.");
  return succeed(orders);
}

export async function getOrderView(orderId: string): Promise<Result<{ order: Order; basket_view: Awaited<ReturnType<typeof getBasketForNgo>> extends Result<infer T> ? T : never }>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) return fail("UNKNOWN", "The order could not be loaded. Please retry.");
  if (!order) return fail("UNKNOWN", "This order was not found.");
  const { data: basket, error: basketError } = await supabase.from("baskets").select("ngo_id").eq("id", order.basket_id).maybeSingle();
  if (basketError || !basket) return fail("UNKNOWN", "The order's basket could not be loaded.");
  const basketResult = await getBasketForNgo(basket.ngo_id);
  if (!basketResult.ok) return basketResult;
  return succeed({ order, basket_view: { ...basketResult.data, order } });
}

export async function confirmDelivery(input: {
  orderId: string;
  proofPath: string;
  note: string;
}): Promise<Result<Order>> {
  const note = receiptNoteSchema.safeParse(input.note);
  if (!note.success) return fail("UNKNOWN", "Enter a receipt note between 1 and 280 characters.");
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data, error } = await supabase.rpc("confirm_delivery", {
    p_order_id: input.orderId,
    p_proof_path: input.proofPath,
    p_note: note.data,
  });
  if (error) return mapServiceError(error.message);
  return succeed(data);
}
