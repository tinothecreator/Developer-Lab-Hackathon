import type { SupabaseClient } from "@supabase/supabase-js";
import type { Basket, BasketView, NGO, Order, Result } from "../types";
import { withClient, success, databaseFailure, failure } from "./result";

export async function loadBasketView(client: SupabaseClient, basket: Basket): Promise<Result<BasketView>> {
  const [ngo, items, order] = await Promise.all([
    client.from("ngos").select("*").eq("id", basket.ngo_id).single<NGO>(),
    client.from("basket_items").select("*, catalogue_item:catalogue_items(*)").eq("basket_id", basket.id).order("id").returns<BasketView["items"]>(),
    client.from("orders").select("*").eq("basket_id", basket.id).maybeSingle<Order>(),
  ]);
  if (ngo.error) return databaseFailure(ngo.error);
  if (items.error) return databaseFailure(items.error);
  if (order.error) return databaseFailure(order.error);
  return success({ basket, ngo: ngo.data, items: items.data ?? [], order: order.data, remaining_cents: basket.target_cents - basket.funded_cents });
}
export async function getBasketForNgo(ngoId: string): Promise<Result<BasketView>> {
  return withClient(async (client) => {
    const { data, error } = await client.from("baskets").select("*").eq("ngo_id", ngoId).order("created_at", { ascending: false }).limit(1).maybeSingle<Basket>();
    if (error) return databaseFailure(error);
    if (!data) return failure("UNKNOWN", "No shared basket is available for this organisation.");
    return loadBasketView(client, data);
  });
}
