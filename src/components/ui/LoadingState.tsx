import { Spinner } from "./Spinner";

export function LoadingState({ label = "Loading the latest details…" }: { label?: string }) {
  return <div className="py-10 text-sm text-[var(--muted)]"><Spinner label={label} /></div>;
}
