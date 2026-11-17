import type { BasketView, Result } from "@/lib/types";
import { fail, getSupabaseClient, succeed, unavailable } from "@/lib/services/shared";

export async function getBasketForNgo(ngoId: string): Promise<Result<BasketView>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data: ngo, error: ngoError } = await supabase.from("ngos").select("*").eq("id", ngoId).maybeSingle();
  if (ngoError) return fail("UNKNOWN", "The NGO could not be loaded. Please retry.");
  if (!ngo) return fail("UNKNOWN", "This NGO was not found.");
  const { data: basket, error: basketError } = await supabase.from("baskets").select("*")
    .eq("ngo_id", ngoId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (basketError) return fail("UNKNOWN", "The basket could not be loaded. Please retry.");
  if (!basket) return fail("UNKNOWN", "There is no seeded basket for this NGO.");
  const { data: basketItems, error: basketItemsError } = await supabase.from("basket_items").select("*").eq("basket_id", basket.id);
  if (basketItemsError) return fail("UNKNOWN", "Basket contents could not be loaded. Please retry.");
  const catalogueIds = [...new Set(basketItems.map((item) => item.catalogue_item_id))];
  const { data: catalogue, error: catalogueError } = catalogueIds.length
    ? await supabase.from("catalogue_items").select("*").in("id", catalogueIds)
    : { data: [], error: null };
  if (catalogueError) return fail("UNKNOWN", "Grocery details could not be loaded. Please retry.");
  const catalogueById = new Map(catalogue.map((item) => [item.id, item]));
  const items: BasketView["items"] = [];
  for (const item of basketItems) {
    const catalogue_item = catalogueById.get(item.catalogue_item_id);
    if (!catalogue_item) return fail("UNKNOWN", "A basket grocery detail is missing.");
    items.push({ ...item, catalogue_item });
  }
  const { data: order, error: orderError } = await supabase.from("orders").select("*")
    .eq("basket_id", basket.id).maybeSingle();
  if (orderError) return fail("UNKNOWN", "Order status could not be loaded. Please retry.");
  return succeed({
    basket,
    ngo,
    items,
    remaining_cents: basket.target_cents - basket.funded_cents,
    order,
  });
}
