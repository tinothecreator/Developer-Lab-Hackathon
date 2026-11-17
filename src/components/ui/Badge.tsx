import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 ${className}`} {...props} />;
}
