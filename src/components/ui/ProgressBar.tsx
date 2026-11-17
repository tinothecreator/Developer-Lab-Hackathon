export function ProgressBar({ value, max, label = "Basket funding" }: { value: number; max: number; label?: string }) {
  return <progress className="funding-progress" aria-label={label} value={value} max={max > 0 ? max : 1}>{max > 0 ? Math.floor(value * 100 / max) : 0}% funded</progress>;
}
