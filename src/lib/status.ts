import type { Order } from "./types";

export function getStatusLabel(order: Order | null): string {
  if (!order) return "Awaiting funding";
  return order.status === "delivered" ? "Delivered" : "Awaiting delivery";
}
