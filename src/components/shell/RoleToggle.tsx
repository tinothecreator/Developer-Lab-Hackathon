"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Role = "donor" | "ngo";
const STORAGE_KEY = "charity-eats-role";
const ROLE_EVENT = "charity-eats-role-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ROLE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ROLE_EVENT, callback);
  };
}

function getRole(): Role {
  return window.localStorage.getItem(STORAGE_KEY) === "ngo" ? "ngo" : "donor";
}

export function RoleToggle() {
  const role = useSyncExternalStore(subscribe, getRole, () => "donor");
  const router = useRouter();
  const pathname = usePathname();

  function changeRole(nextRole: Role) {
    window.localStorage.setItem(STORAGE_KEY, nextRole);
    window.dispatchEvent(new Event(ROLE_EVENT));
    router.push(nextRole === "ngo" ? "/ngo" : "/");
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1" aria-label="Demo role">
      <Button type="button" className="min-h-9 px-3 text-sm" variant={role === "donor" ? "primary" : "quiet"} aria-pressed={role === "donor"} onClick={() => changeRole("donor")}>
        Donor
      </Button>
      <Button type="button" className="min-h-9 px-3 text-sm" variant={role === "ngo" ? "primary" : "quiet"} aria-pressed={role === "ngo"} onClick={() => changeRole("ngo")}>
        NGO
      </Button>
      <span className="sr-only">Current page: {pathname}</span>
    </div>
  );
}
