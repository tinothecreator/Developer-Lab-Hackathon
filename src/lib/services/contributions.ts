import type { Basket, Contribution, ContributionInput, ContributionResult, ContributionTracking, Result } from "../types";
import { contributionSchema } from "../validation";
import { withClient, success, databaseFailure, failure } from "./result";
import { loadBasketView } from "./baskets";

export async function submitContribution(input: ContributionInput): Promise<Result<ContributionResult>> {
  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) return failure("INVALID_AMOUNT", "Choose a valid basket and positive amount in whole cents.");
  return withClient(async (client) => {
    const { basketId, demoDonorId, amountCents, checkoutKey } = parsed.data;
    const { data, error } = await client.rpc("contribute_to_basket", {
      p_basket_id: basketId, p_demo_donor_id: demoDonorId, p_amount_cents: amountCents, p_checkout_key: checkoutKey,
    });
    if (error) return databaseFailure(error);
    if (!data || typeof data.contribution_id !== "string" || data.basket_id !== basketId
      || data.amount_cents !== amountCents || !Number.isInteger(data.funded_cents)
      || !Number.isInteger(data.target_cents) || data.funded_cents > data.target_cents
      || !["funding", "funded"].includes(data.basket_status)
      || !(data.order_id === null || typeof data.order_id === "string")) {
      return failure("UNKNOWN", "The payment response was uncertain. Retry this same attempt to check its saved result.");
    }
    return success(data as ContributionResult);
  });
}
export async function getContributionTracking(contributionId: string): Promise<Result<ContributionTracking>> {
  return withClient(async (client) => {
    const contribution = await client.from("contributions").select("*").eq("id", contributionId).maybeSingle<Contribution>();
    if (contribution.error) return databaseFailure(contribution.error);
    if (!contribution.data) return failure("UNKNOWN", "This contribution was not found. Check the link or retry.");
    const basket = await client.from("baskets").select("*").eq("id", contribution.data.basket_id).single<Basket>();
    if (basket.error) return databaseFailure(basket.error);
    const view = await loadBasketView(client, basket.data);
    return view.ok ? success({ contribution: contribution.data, basket_view: view.data }) : view;
  });
}
