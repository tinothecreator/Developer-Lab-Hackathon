import { getSupabaseClient } from "@/lib/supabase/client";
import type { Result } from "@/lib/types";

export function fail<T>(code: string, message: string): Result<T> {
  return { ok: false, error: { code, message } };
}

export function succeed<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function unavailable<T>(): Result<T> {
  return fail("UNKNOWN", "Supabase is not configured. Add the public URL and anon key to .env.local.");
}

export function mapServiceError<T>(message: string): Result<T> {
  const codes = ["INVALID_AMOUNT", "OVERFUNDED", "BASKET_FULL", "KEY_REUSED", "UPLOAD_FAILED", "NOT_AWAITING_DELIVERY"];
  const code = codes.find((candidate) => message.includes(candidate)) ?? "UNKNOWN";
  const readable: Record<string, string> = {
    INVALID_AMOUNT: "Enter a valid contribution amount.",
    OVERFUNDED: "The remaining balance changed. Review the refreshed amount before trying again.",
    BASKET_FULL: "This basket is already fully funded.",
    KEY_REUSED: "This checkout attempt was already used with different details.",
    UPLOAD_FAILED: "The receipt could not be uploaded. Check the image and try again.",
    NOT_AWAITING_DELIVERY: "This order is no longer awaiting delivery.",
    UNKNOWN: "Something went wrong. Please try again.",
  };
  return fail(code, readable[code]);
}

export { getSupabaseClient };
