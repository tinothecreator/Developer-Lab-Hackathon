import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "../supabase/client";
import type { Result } from "../types";

export const success = <T>(data: T): Result<T> => ({ ok: true, data });
export const failure = <T>(code: string, message: string): Result<T> => ({ ok: false, error: { code, message } });
const messages: Record<string, string> = {
  INVALID_AMOUNT: "Choose a positive amount in whole cents.",
  OVERFUNDED: "This amount exceeds the remaining balance. Review the latest funding and choose again.",
  BASKET_FULL: "This basket is already fully funded. No contribution was recorded.",
  KEY_REUSED: "This checkout key belongs to a different attempt. Return to the basket and choose your amount again.",
  UPLOAD_FAILED: "The proof photo could not be saved or found. Keep your form and try again.",
  NOT_AWAITING_DELIVERY: "This order is not awaiting delivery. Refresh to see its latest status.",
};
export function databaseFailure<T>(error: { message: string }): Result<T> {
  const code = Object.keys(messages).find((key) => error.message === key) ?? "UNKNOWN";
  return failure(code, messages[code] ?? "The demo backend could not complete this request. Check that migrations and seeds are applied, then retry.");
}
export async function withClient<T>(work: (client: SupabaseClient) => Promise<Result<T>>): Promise<Result<T>> {
  try { return await work(getSupabase()); }
  catch { return failure("UNKNOWN", "Could not reach the demo backend. Check the public configuration and connection, then retry."); }
}
