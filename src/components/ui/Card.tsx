import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-2xl border border-stone-200 bg-white p-5 shadow-sm ${className}`} {...props} />;
}
