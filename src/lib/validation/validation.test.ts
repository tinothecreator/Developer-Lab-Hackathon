import { test } from "node:test";
import assert from "node:assert/strict";
import { validateProof, receiptNoteSchema, contributionSchema } from "./index";
import { seedId, MAX_PROOF_SIZE_BYTES } from "../constants";

test("proof validation rejects invalid/empty/oversized files before upload", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(validateProof(new File(["demo"], "proof", { type })).ok, true);
  assert.equal(validateProof(new File(["demo"], "proof.svg", { type: "image/svg+xml" })).ok, false);
  assert.equal(validateProof(new File([], "empty.png", { type: "image/png" })).ok, false);
  assert.equal(validateProof(new File([new Uint8Array(MAX_PROOF_SIZE_BYTES + 1)], "large.png", { type: "image/png" })).ok, false);
});
test("receipt notes are trimmed and bounded", () => {
  assert.equal(receiptNoteSchema.parse("  Demo groceries received.  "), "Demo groceries received.");
  assert.equal(receiptNoteSchema.safeParse("   ").success, false);
  assert.equal(receiptNoteSchema.safeParse("x".repeat(281)).success, false);
});
test("contributions reject fractional cents and invalid amounts", () => {
  const input = { basketId: seedId(301), demoDonorId: seedId(501), checkoutKey: seedId(901), amountCents: 5000 };
  assert.equal(contributionSchema.safeParse(input).success, true);
  for (const amountCents of [0, -1, 0.5, NaN, Infinity]) assert.equal(contributionSchema.safeParse({ ...input, amountCents }).success, false);
});
