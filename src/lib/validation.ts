import { z } from "zod";
import { ALLOWED_PROOF_TYPES, MAX_PROOF_SIZE_BYTES, RECEIPT_NOTE_MAX } from "@/lib/constants";

export const contributionSchema = z.object({
  basketId: z.string().uuid(),
  demoDonorId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  checkoutKey: z.string().uuid(),
}).strict();

export const receiptNoteSchema = z.string().trim().min(1).max(RECEIPT_NOTE_MAX);

export function validateProofFile(file: File): string | null {
  if (!ALLOWED_PROOF_TYPES.includes(file.type as (typeof ALLOWED_PROOF_TYPES)[number])) {
    return "Choose a JPEG, PNG or WebP image.";
  }
  if (file.size > MAX_PROOF_SIZE_BYTES) return "The image must be 5 MB or smaller.";
  return null;
}
