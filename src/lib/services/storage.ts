import { PROOF_BUCKET } from "../constants";
import { getSupabase } from "../supabase/client";
import { validateProof } from "../validation";
import type { Result } from "../types";
import { withClient, success, failure } from "./result";

export async function uploadProof(orderId: string, file: File): Promise<Result<{ path: string }>> {
  const validation = validateProof(file);
  if (!validation.ok) return validation;
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return failure("UPLOAD_FAILED", "Choose an awaiting-delivery order first.");
  return withClient(async (client) => {
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
    const path = `${orderId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from(PROOF_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    return error ? failure("UPLOAD_FAILED", "Photo upload failed. Your photo and note are kept; please retry.") : success({ path });
  });
}
export function getProofUrl(path: string): string {
  try { return getSupabase().storage.from(PROOF_BUCKET).getPublicUrl(path).data.publicUrl; }
  catch { return ""; }
}
