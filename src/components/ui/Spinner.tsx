export function Spinner({ label = "Loading…" }: { label?: string }) {
  return <span className="inline-flex items-center gap-3" role="status"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />{label}</span>;
}
