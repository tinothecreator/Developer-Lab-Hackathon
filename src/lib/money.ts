const zar = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" });

export function formatZar(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error("Money must be integer cents.");
  return zar.format(cents / 100);
}

/** Reject fractions of a cent; never round a donor's selection. */
export function parseRandToCents(input: string): number | null {
  const text = input.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 2147483647 ? cents : null;
}
