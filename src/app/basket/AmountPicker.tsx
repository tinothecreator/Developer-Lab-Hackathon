"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QUICK_CONTRIBUTION_CENTS } from "@/lib/constants";
import { formatZar, parseRandToCents } from "@/lib/money";

export function AmountPicker({ basketId, ngoId, remainingCents }: { basketId: string; ngoId: string; remainingCents: number }) {
  const [amountCents, setAmountCents] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function chooseAmount(amount: number) {
    setAmountCents(amount);
    setCustomAmount("");
    setError("");
  }

  function continueToCheckout() {
    const amount = customAmount ? parseRandToCents(customAmount) : amountCents;
    if (amount === null || !Number.isSafeInteger(amount) || amount <= 0) {
      setError("Enter a positive amount in rand with up to two decimal places.");
      return;
    }
    if (amount > remainingCents) {
      setError(`That amount is above the remaining ${formatZar(remainingCents)}.`);
      return;
    }
    router.push(`/checkout?basketId=${encodeURIComponent(basketId)}&ngoId=${encodeURIComponent(ngoId)}&amountCents=${amount}`);
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="font-semibold">Choose a contribution amount</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_CONTRIBUTION_CENTS.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={amountCents === amount && !customAmount ? "primary" : "secondary"}
              disabled={amount > remainingCents}
              aria-pressed={amountCents === amount && !customAmount}
              onClick={() => chooseAmount(amount)}
            >
              {formatZar(amount)}
            </Button>
          ))}
          <Button
            type="button"
            variant={amountCents === remainingCents && !customAmount ? "primary" : "secondary"}
            disabled={remainingCents <= 0}
            aria-pressed={amountCents === remainingCents && !customAmount}
            onClick={() => chooseAmount(remainingCents)}
          >
            Fund remaining · {formatZar(remainingCents)}
          </Button>
        </div>
      </fieldset>
      <div>
        <label htmlFor="custom-amount" className="font-semibold">Or enter a custom amount (ZAR)</label>
        <div className="mt-2 flex gap-2">
          <span className="flex min-h-11 items-center rounded-xl border border-stone-300 bg-stone-100 px-3" aria-hidden="true">R</span>
          <input
            id="custom-amount"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-stone-300 px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800"
            inputMode="decimal"
            placeholder="e.g. 25.50"
            value={customAmount}
            onChange={(event) => {
              setCustomAmount(event.target.value);
              setAmountCents(0);
              setError("");
            }}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-800" role="alert">{error}</p>}
      <Button type="button" className="w-full sm:w-auto" disabled={remainingCents <= 0} onClick={continueToCheckout}>Continue to checkout</Button>
    </div>
  );
}
