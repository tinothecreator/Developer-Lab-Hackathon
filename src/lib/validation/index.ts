import { z } from "zod";
import { ALLOWED_PROOF_TYPES, MAX_PROOF_SIZE_BYTES, RECEIPT_NOTE_MAX } from "../constants";
import type { Result } from "../types";

export const contributionSchema = z.object({
  basketId: z.uuid(), demoDonorId: z.uuid(), checkoutKey: z.uuid(),
  amountCents: z.number().int().positive().max(2147483647),
}).strict();
export const receiptNoteSchema = z.string().trim().min(1, "Write a short receipt note.").max(RECEIPT_NOTE_MAX, "Keep the note to 280 characters.");
export function validateProof(file: File): Result<File> {
  if (!(ALLOWED_PROOF_TYPES as readonly string[]).includes(file.type)) return { ok: false, error: { code: "UPLOAD_FAILED", message: "Choose a JPEG, PNG or WebP image." } };
  if (file.size === 0 || file.size > MAX_PROOF_SIZE_BYTES) return { ok: false, error: { code: "UPLOAD_FAILED", message: "Choose a non-empty image no larger than 5 MB." } };
  return { ok: true, data: file };
}
