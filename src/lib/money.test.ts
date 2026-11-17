import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRandToCents, formatZar } from "./money";

test("rand parsing preserves whole cents without rounding", () => {
  for (const [input, cents] of [["50", 5000], ["100.00", 10000], ["0.01", 1], [" 1.2 ", 120]] as const) assert.equal(parseRandToCents(input), cents);
  for (const input of ["", "0", "-1", "1.001", "1e2", "NaN", "Infinity", "R50", "1,50", "21474836.48"]) assert.equal(parseRandToCents(input), null, input);
});
test("ZAR formatting accepts integer cents only", () => {
  assert.match(formatZar(55000), /550[.,]00/);
  assert.throws(() => formatZar(1.5));
});
