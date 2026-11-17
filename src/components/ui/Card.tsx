import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`min-w-0 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7 ${className}`} {...props} />;
}
