"use client";

import Link from "next/link";
import { RoleToggle } from "./RoleToggle";
import { NgoSelector } from "./NgoSelector";
import { useDemoRole } from "./RoleProvider";

export function AppHeader() {
  const { role, setRole } = useDemoRole();
  return <header className="border-b border-[var(--border)] bg-[var(--paper)]">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link href="/" onClick={() => setRole("donor")} className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight" aria-label="Charity Eats donor home">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green)] text-white" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9h12l1 12H5L6 9Z" stroke="currentColor" strokeWidth="1.7" /><path d="M9 9V7a3 3 0 0 1 6 0v2M12 15v3m0-3c-3 0-4-2-4-2 3-1 4 2 4 2Zm0 0c3 0 4-2 4-2-3-1-4 2-4 2Z" stroke="currentColor" strokeWidth="1.5" /></svg></span>
        Charity<span className="text-[var(--green)]">Eats</span>
      </Link>
      <div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold text-[var(--muted)]">Hackathon demo</span><RoleToggle /></div>
      {role === "ngo" && <NgoSelector />}
    </div>
  </header>;
}
