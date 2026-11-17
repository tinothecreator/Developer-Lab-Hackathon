export function ProgressBar({ fundedCents, targetCents }: { fundedCents: number; targetCents: number }) {
  const percentage = targetCents > 0 ? Math.min(100, Math.max(0, (fundedCents / targetCents) * 100)) : 0;
  return (
    <div
      className="h-3 overflow-hidden rounded-full bg-stone-200"
      role="progressbar"
      aria-label="Basket funding progress"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-emerald-700 transition-[width]" style={{ width: `${percentage}%` }} />
    </div>
  );
}
