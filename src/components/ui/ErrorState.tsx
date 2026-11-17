"use client";

import { ErrorMessage } from "./ErrorMessage";

export function ErrorState(props: { message: string; onRetry?: () => void }) {
  return <ErrorMessage {...props} />;
}
