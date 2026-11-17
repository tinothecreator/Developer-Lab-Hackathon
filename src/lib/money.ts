export function formatZar(cents: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(cents / 100);
}

export function parseRandToCents(value: string): number | null {
  const match = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const whole = Number(match[1]);
  const fractional = Number((match[2] ?? "").padEnd(2, "0"));
  const cents = whole * 100 + fractional;
  return Number.isSafeInteger(cents) ? cents : null;
}

export function getRemainingCents(basket: { target_cents: number; funded_cents: number }): number {
  return basket.target_cents - basket.funded_cents;
}
