"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { NgoSelector } from "@/components/shell/NgoSelector";
import { RoleToggle } from "@/components/shell/RoleToggle";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("charity-eats-role-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("charity-eats-role-changed", callback);
  };
}

function getIsNgo() {
  return window.localStorage.getItem("charity-eats-role") === "ngo";
}

export function AppHeader() {
  const isNgo = useSyncExternalStore(subscribe, getIsNgo, () => false);

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800">
          Charity Eats <span className="text-sm font-medium text-stone-500">demo</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {isNgo && <NgoSelector />}
          <RoleToggle />
        </div>
      </div>
    </header>
  );
}
