import type { Order, OrderStatus } from "@/lib/types";

export function getDeliveryStatusLabel(order: Order | null): string {
  if (!order) return "Awaiting funding";
  return getOrderStatusLabel(order.status);
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return status === "delivered" ? "Delivered" : "Awaiting delivery";
}
