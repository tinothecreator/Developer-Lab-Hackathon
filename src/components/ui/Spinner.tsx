export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-6" role="status" aria-live="polite">
      <span className="size-5 animate-spin rounded-full border-2 border-emerald-800 border-r-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
