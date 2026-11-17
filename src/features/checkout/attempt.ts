const STORAGE_KEY = "charity-eats:checkout-attempt";
let memoryAttempt = "";

export function getAttemptSnapshot(): string {
  try { return sessionStorage.getItem(STORAGE_KEY) ?? memoryAttempt; } catch { return memoryAttempt; }
}
export const getServerAttemptSnapshot = () => "";
export function subscribeAttempt(listener: () => void) {
  window.addEventListener("charity-eats:attempt", listener);
  return () => window.removeEventListener("charity-eats:attempt", listener);
}
function saveAttempt(value: string) {
  memoryAttempt = value;
  try { sessionStorage.setItem(STORAGE_KEY, value); } catch { /* In-memory retries still work. */ }
  window.dispatchEvent(new Event("charity-eats:attempt"));
}
export function isSubmittedAttempt(snapshot: string, basketId: string, amountCents: number): boolean {
  try {
    const saved = JSON.parse(snapshot);
    return saved?.basketId === basketId && saved?.amountCents === amountCents && saved?.submitted === true;
  } catch { return false; }
}
export function markAttemptSubmitted(key: string, submitted: boolean) {
  try {
    const saved = JSON.parse(getAttemptSnapshot());
    if (saved?.key === key) saveAttempt(JSON.stringify({ ...saved, submitted }));
  } catch { /* The caller's ref still preserves its key. */ }
}

/** One current attempt; changing its amount creates a new key, including A → B → A. */
export function getAttemptKey(basketId: string, amountCents: number): string {
  try {
    const saved: unknown = JSON.parse(getAttemptSnapshot() || "null");
    if (saved && typeof saved === "object" && "basketId" in saved && "amountCents" in saved && "key" in saved
      && saved.basketId === basketId && saved.amountCents === amountCents
      && typeof saved.key === "string" && /^[0-9a-f-]{36}$/.test(saved.key)) return saved.key;
  } catch { /* A ref keeps the key stable if browser storage is unavailable. */ }
  const key = crypto.randomUUID();
  saveAttempt(JSON.stringify({ basketId, amountCents, key, submitted: false }));
  return key;
}
