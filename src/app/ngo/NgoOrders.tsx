"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Spinner } from "@/components/ui/Spinner";
import { fixtureNgos } from "@/lib/fixtures";
import { getFundedOrdersForNgo } from "@/lib/services/orders";
import { getOrderStatusLabel } from "@/lib/status";
import type { Order } from "@/lib/types";

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
  const saved = window.localStorage.getItem("charity-eats-ngo");
  return fixtureNgos.some((ngo) => ngo.id === saved) ? saved! : fixtureNgos[0].id;
}

export function NgoOrders() {
  const ngoId = useSyncExternalStore(subscribe, getSelectedNgo, () => fixtureNgos[0].id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    getFundedOrdersForNgo(ngoId).then((result) => {
      if (!active) return;
      if (result.ok) {
        setOrders(result.data);
        setState("ready");
      } else {
        setErrorMessage(result.error.message);
        setState("error");
      }
    });
    return () => { active = false; };
  }, [ngoId, reload]);

  if (state === "loading") return <Spinner label="Loading funded orders…" />;
  if (state === "error") return <ErrorMessage message={errorMessage} onRetry={() => setReload((count) => count + 1)} />;
  if (orders.length === 0) return <EmptyState>No funded orders yet.</EmptyState>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">Grocery order</p>
            <Badge className="mt-2">{getOrderStatusLabel(order.status)}</Badge>
            <p className="mt-2 text-sm text-stone-600">Delivery simulated (demo)</p>
          </div>
          <Link className="font-semibold text-emerald-900 underline underline-offset-4" href={`/ngo/orders/${order.id}`}>Open order</Link>
        </Card>
      ))}
      <button className="min-h-11 font-semibold text-emerald-900 underline underline-offset-4" onClick={() => setReload((count) => count + 1)}>Refresh orders</button>
    </div>
  );
}
