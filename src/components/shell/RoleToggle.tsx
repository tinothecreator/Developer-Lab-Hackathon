"use client";

import { useDemoRole } from "./RoleProvider";

export function RoleToggle() {
  const { role, setRole } = useDemoRole();
  return <div className="inline-flex rounded-xl border border-[var(--border)] bg-white p-1" role="group" aria-label="Demo view">
    {(["donor", "ngo"] as const).map((value) => <button key={value} type="button" aria-pressed={role === value} onClick={() => setRole(value)} className={`min-h-11 rounded-lg px-5 text-sm font-bold ${role === value ? "bg-[var(--green)] text-white" : "text-[var(--muted)] hover:bg-stone-100"}`}>{value === "donor" ? "Donor" : "NGO"}</button>)}
  </div>;
}
