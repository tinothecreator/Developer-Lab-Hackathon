import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <Card><h2 className="text-xl font-bold">{title}</h2>{children && <div className="mt-2 text-sm text-[var(--muted)]">{children}</div>}</Card>;
}
