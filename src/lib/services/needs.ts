import type { NeedWithItem, Result } from "@/lib/types";
import { fail, getSupabaseClient, succeed, unavailable } from "@/lib/services/shared";

export async function getNeedsForNgo(ngoId: string): Promise<Result<NeedWithItem[]>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data: needs, error } = await supabase.from("needs").select("*").eq("ngo_id", ngoId).eq("status", "open").order("id");
  if (error) return fail("UNKNOWN", "Needs could not be loaded. Please retry.");
  if (needs.length === 0) return succeed([]);
  const itemIds = [...new Set(needs.map((need) => need.catalogue_item_id))];
  const { data: items, error: itemError } = await supabase.from("catalogue_items").select("*").in("id", itemIds);
  if (itemError) return fail("UNKNOWN", "Grocery details could not be loaded. Please retry.");
  const itemById = new Map(items.map((item) => [item.id, item]));
  const result: NeedWithItem[] = [];
  for (const need of needs) {
    const catalogue_item = itemById.get(need.catalogue_item_id);
    if (!catalogue_item) return fail("UNKNOWN", "A grocery detail is missing from this need.");
    result.push({ ...need, catalogue_item });
  }
  return succeed(result);
}
