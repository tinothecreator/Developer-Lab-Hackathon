"use client";

import { Button } from "./Button";

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"><p>{message}</p>{onRetry && <Button onClick={onRetry}>Try again</Button>}</div>;
}
