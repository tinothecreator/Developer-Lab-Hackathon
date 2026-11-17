"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SHOWCASE_NGO_ID, seedId } from "@/lib/constants";

type Role = "donor" | "ngo";
const ROLE_KEY = "charity-eats:role";
const NGO_KEY = "charity-eats:ngo";
const fallback = new Map<string, string>();
function read(key: string): string | null {
  try { return localStorage.getItem(key) ?? fallback.get(key) ?? null; } catch { return fallback.get(key) ?? null; }
}
function persist(key: string, value: string) {
  fallback.set(key, value);
  try { localStorage.setItem(key, value); } catch { /* Keep the view usable when storage is disabled. */ }
  window.dispatchEvent(new Event("charity-eats:context"));
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("charity-eats:context", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("charity-eats:context", listener); };
}
function getNgoSnapshot() {
  const id = read(NGO_KEY);
  return [1, 2, 3, 4, 5].some((n) => seedId(n) === id) ? id! : SHOWCASE_NGO_ID;
}
const getServerNgoSnapshot = () => SHOWCASE_NGO_ID;
const RoleContext = createContext<{
  role: Role; selectedNgoId: string;
  setRole: (role: Role) => void; setSelectedNgoId: (id: string) => void;
} | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role: Role = pathname === "/ngo" || pathname.startsWith("/ngo/") ? "ngo" : "donor";
  const selectedNgoId = useSyncExternalStore(subscribe, getNgoSnapshot, getServerNgoSnapshot);
  useEffect(() => {
    if (pathname === "/" && read(ROLE_KEY) === "ngo") router.replace("/ngo");
    else persist(ROLE_KEY, role);
  }, [pathname, role, router]);
  function setRole(next: Role) {
    persist(ROLE_KEY, next);
    router.push(next === "ngo" ? "/ngo" : "/");
    router.refresh();
    window.dispatchEvent(new Event("charity-eats:refresh"));
  }
  function setSelectedNgoId(id: string) {
    persist(NGO_KEY, id);
    router.push("/ngo");
    router.refresh();
    window.dispatchEvent(new Event("charity-eats:refresh"));
  }
  return <RoleContext.Provider value={{ role, selectedNgoId, setRole, setSelectedNgoId }}>{children}</RoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useDemoRole must be used inside RoleProvider.");
  return context;
}
