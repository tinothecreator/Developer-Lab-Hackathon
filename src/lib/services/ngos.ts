import type { NGO, NeedWithItem, Result } from "../types";
import { withClient, success, databaseFailure, failure } from "./result";

export async function getNgos(): Promise<Result<NGO[]>> {
  return withClient(async (client) => {
    const { data, error } = await client.from("ngos").select("*").order("id").returns<NGO[]>();
    return error ? databaseFailure(error) : success(data ?? []);
  });
}
export async function getNgoById(id: string): Promise<Result<NGO>> {
  return withClient(async (client) => {
    const { data, error } = await client.from("ngos").select("*").eq("id", id).maybeSingle<NGO>();
    return error ? databaseFailure(error) : data ? success(data) : failure("UNKNOWN", "This fictional organisation was not found.");
  });
}
export async function getNeedsForNgo(ngoId: string): Promise<Result<NeedWithItem[]>> {
  return withClient(async (client) => {
    const { data, error } = await client.from("needs").select("*, catalogue_item:catalogue_items(*)").eq("ngo_id", ngoId).eq("status", "open").order("id").returns<NeedWithItem[]>();
    return error ? databaseFailure(error) : success(data ?? []);
  });
}
