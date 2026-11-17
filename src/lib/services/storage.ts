import { ALLOWED_PROOF_TYPES, PROOF_BUCKET } from "@/lib/constants";
import { validateProofFile } from "@/lib/validation";
import type { Result } from "@/lib/types";
import { fail, getSupabaseClient, mapServiceError, succeed, unavailable } from "@/lib/services/shared";

export async function uploadProof(orderId: string, file: File): Promise<Result<{ path: string }>> {
  const validationError = validateProofFile(file);
  if (validationError) return fail("UPLOAD_FAILED", validationError);
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  if (!ALLOWED_PROOF_TYPES.includes(file.type as (typeof ALLOWED_PROOF_TYPES)[number])) {
    return fail("UPLOAD_FAILED", "Choose a JPEG, PNG or WebP image.");
  }
  const path = `${orderId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PROOF_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return mapServiceError(`UPLOAD_FAILED ${error.message}`);
  return succeed({ path });
}

export function getProofUrl(path: string): string {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured. Add the public URL and anon key to .env.local.");
  return supabase.storage.from(PROOF_BUCKET).getPublicUrl(path).data.publicUrl;
}
