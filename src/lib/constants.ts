export const STATUSES = {
  basket: ["funding", "funded"],
  contribution: ["paid"],
  order: ["awaiting_delivery", "delivered"],
  need: ["open", "fulfilled"],
} as const;

export const PROOF_BUCKET = "delivery-proofs";
export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const RECEIPT_NOTE_MIN = 1;
export const RECEIPT_NOTE_MAX = 280;
export const QUICK_CONTRIBUTION_CENTS = [5000, 10000] as const;
export const SHOWCASE_NGO_ID = "00000000-0000-4000-8000-000000000001";
export const SHOWCASE_BASKET_ID = "00000000-0000-4000-8000-000000000301";
export const DEMO_DONOR_ID = "00000000-0000-4000-8000-000000000501";
