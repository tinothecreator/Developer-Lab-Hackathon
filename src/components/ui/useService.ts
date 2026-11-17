"use client";

import { useEffect, useReducer, useState } from "react";
import type { Result } from "@/lib/types";

/** A changed loader or retry hides stale data until the latest persisted read finishes. */
export function useService<T>(load: () => Promise<Result<T>>) {
  const [attempt, retry] = useReducer((n: number) => n + 1, 0);
  const [state, setState] = useState<{ load: typeof load; attempt: number; result: Result<T> } | null>(null);
  useEffect(() => {
    let active = true;
    load().catch((): Result<T> => ({ ok: false, error: { code: "UNKNOWN", message: "Could not load the latest details. Please retry." } }))
      .then((result) => { if (active) setState({ load, attempt, result }); });
    return () => { active = false; };
  }, [load, attempt]);
  useEffect(() => {
    window.addEventListener("charity-eats:refresh", retry);
    return () => window.removeEventListener("charity-eats:refresh", retry);
  }, []);
  const result = state?.load === load && state.attempt === attempt ? state.result : null;
  return { result, isLoading: result === null, retry };
}
