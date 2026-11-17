export function Toast({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "info" }) {
  const styles = tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-sky-300 bg-sky-50 text-sky-950";
  return <div className={`rounded-xl border p-4 ${styles}`} role="status" aria-live="polite">{children}</div>;
}
