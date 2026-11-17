import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" }) {
  const tones = { neutral: "bg-stone-100 text-stone-700", success: "bg-emerald-50 text-emerald-900", warning: "bg-amber-50 text-amber-900" };
  return <span className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
