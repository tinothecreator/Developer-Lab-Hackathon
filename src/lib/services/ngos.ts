import type { NGO, Result } from "@/lib/types";
import { fail, getSupabaseClient, succeed, unavailable } from "@/lib/services/shared";

export async function getNgos(): Promise<Result<NGO[]>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data, error } = await supabase.from("ngos").select("*").order("name");
  if (error) return fail("UNKNOWN", "NGOs could not be loaded. Please retry.");
  return succeed(data);
}

export async function getNgoById(id: string): Promise<Result<NGO>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data, error } = await supabase.from("ngos").select("*").eq("id", id).maybeSingle();
  if (error) return fail("UNKNOWN", "This NGO could not be loaded. Please retry.");
  if (!data) return fail("UNKNOWN", "This NGO was not found.");
  return succeed(data);
}
