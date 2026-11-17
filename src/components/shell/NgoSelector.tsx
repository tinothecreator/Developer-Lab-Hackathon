"use client";

import { getNgos } from "@/lib/services";
import { useService } from "@/components/ui/useService";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useDemoRole } from "./RoleProvider";

export function NgoSelector() {
  const { selectedNgoId, setSelectedNgoId } = useDemoRole();
  const { result, retry } = useService(getNgos);
  if (result && !result.ok) return <ErrorMessage message={result.error.message} onRetry={retry} />;
  return <div className="w-full min-w-0 sm:max-w-sm">
    <label htmlFor="selected-ngo" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">NGO workspace (demo)</label>
    <select id="selected-ngo" value={selectedNgoId} disabled={!result || !result.ok || result.data.length === 0} onChange={(e) => setSelectedNgoId(e.target.value)}>
      {!result ? <option value={selectedNgoId}>Loading organisations…</option> : result.data.length === 0 ? <option value={selectedNgoId}>No organisations available</option> : result.data.map((ngo) => <option key={ngo.id} value={ngo.id}>{ngo.name}</option>)}
    </select>
  </div>;
}
