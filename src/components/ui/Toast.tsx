import type { ReactNode } from "react";

export function Toast({ children }: { children: ReactNode }) {
  return <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><p className="mb-1 font-bold">Notification (demo)</p>{children}</div>;
}
