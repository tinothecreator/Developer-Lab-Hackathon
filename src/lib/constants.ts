export const seedId = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const SHOWCASE_NGO_ID = seedId(1);
export const SHOWCASE_BASKET_ID = seedId(301);
export const DEMO_DONOR_ID = seedId(501);
export const QUICK_CONTRIBUTION_CENTS = [5000, 10000] as const;
export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const RECEIPT_NOTE_MAX = 280;
export const PROOF_BUCKET = "delivery-proofs";
