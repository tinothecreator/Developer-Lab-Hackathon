// M1 first handoff: typed, read-only fixtures. Replaced with live services next.
import { fixtureNgos, fixtureNeeds, fixtureBasketView, fixtureContributions } from "../fixtures";
import type { NGO, NeedWithItem, BasketView, ContributionResult, ContributionTracking, Order, Result, ContributionInput, DeliveryInput } from "../types";

const ok = <T>(data: T): Result<T> => ({ ok: true, data });
const unavailable = <T>(): Result<T> => ({ ok: false, error: { code: "UNKNOWN", message: "Fixture preview only. Live persistence is not connected yet. Please retry after backend setup." } });
export async function getNgos(): Promise<Result<NGO[]>> { return ok(fixtureNgos); }
export async function getNgoById(id: string): Promise<Result<NGO>> {
  const ngo = fixtureNgos.find((n) => n.id === id);
  return ngo ? ok(ngo) : unavailable();
}
export async function getNeedsForNgo(ngoId: string): Promise<Result<NeedWithItem[]>> { return ok(fixtureNeeds.filter((n) => n.ngo_id === ngoId)); }
export async function getBasketForNgo(ngoId: string): Promise<Result<BasketView>> { return ngoId === fixtureBasketView.ngo.id ? ok(fixtureBasketView) : unavailable(); }
export async function submitContribution(input: ContributionInput): Promise<Result<ContributionResult>> { void input; return unavailable(); }
export async function getContributionTracking(id: string): Promise<Result<ContributionTracking>> {
  const contribution = fixtureContributions.find((c) => c.id === id);
  return contribution ? ok({ contribution, basket_view: fixtureBasketView }) : unavailable();
}
export async function getFundedOrdersForNgo(ngoId: string): Promise<Result<Order[]>> { void ngoId; return ok([]); }
export async function getOrderView(orderId: string): Promise<Result<{ order: Order; basket_view: BasketView }>> { void orderId; return unavailable(); }
export async function uploadProof(orderId: string, file: File): Promise<Result<{ path: string }>> { void orderId; void file; return unavailable(); }
export async function confirmDelivery(input: DeliveryInput): Promise<Result<Order>> { void input; return unavailable(); }
export function getProofUrl(path: string): string { void path; return ""; }
