"use client";

import { useSyncExternalStore } from "react";
import { fixtureNgos } from "@/lib/fixtures";

const STORAGE_KEY = "charity-eats-ngo";
const NGO_EVENT = "charity-eats-ngo-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(NGO_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(NGO_EVENT, callback);
  };
}

function getSelectedNgo() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return fixtureNgos.some((ngo) => ngo.id === saved) ? saved! : fixtureNgos[0].id;
}

export function NgoSelector() {
  const ngoId = useSyncExternalStore(subscribe, getSelectedNgo, () => fixtureNgos[0].id);

  function selectNgo(id: string) {
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new Event(NGO_EVENT));
  }

  return (
    <label className="flex min-w-0 items-center gap-2 text-sm font-medium text-stone-700">
      <span className="sr-only">Selected NGO</span>
      <select
        className="min-h-11 max-w-[190px] rounded-xl border border-stone-300 bg-white px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-800 sm:max-w-none"
        value={ngoId}
        onChange={(event) => selectNgo(event.target.value)}
      >
        {fixtureNgos.map((ngo) => <option key={ngo.id} value={ngo.id}>{ngo.name}</option>)}
      </select>
    </label>
  );
}
