import type { Contribution, ContributionResult, ContributionTracking, Result } from "@/lib/types";
import { contributionSchema } from "@/lib/validation";
import { fail, getSupabaseClient, mapServiceError, succeed, unavailable } from "@/lib/services/shared";
import { getBasketForNgo } from "@/lib/services/baskets";

export async function submitContribution(input: {
  basketId: string;
  demoDonorId: string;
  amountCents: number;
  checkoutKey: string;
}): Promise<Result<ContributionResult>> {
  const parsed = contributionSchema.safeParse(input);
  if (!parsed.success) return fail("INVALID_AMOUNT", "Enter a valid contribution amount.");
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data, error } = await supabase.rpc("contribute_to_basket", {
    p_basket_id: parsed.data.basketId,
    p_demo_donor_id: parsed.data.demoDonorId,
    p_amount_cents: parsed.data.amountCents,
    p_checkout_key: parsed.data.checkoutKey,
  });
  if (error) return mapServiceError(error.message);
  return succeed(data);
}

export async function getContributionTracking(contributionId: string): Promise<Result<ContributionTracking>> {
  const supabase = getSupabaseClient();
  if (!supabase) return unavailable();
  const { data: contribution, error } = await supabase.from("contributions").select("*").eq("id", contributionId).maybeSingle();
  if (error) return fail("UNKNOWN", "Contribution tracking could not be loaded. Please retry.");
  if (!contribution) return fail("UNKNOWN", "This contribution was not found.");
  const { data: basket, error: basketError } = await supabase.from("baskets").select("*").eq("id", contribution.basket_id).maybeSingle();
  if (basketError) return fail("UNKNOWN", "Basket tracking could not be loaded. Please retry.");
  if (!basket) return fail("UNKNOWN", "The contribution's basket could not be found.");
  const basketResult = await getBasketForNgo(basket.ngo_id);
  if (!basketResult.ok) return basketResult;
  return succeed({ contribution: contribution as Contribution, basket_view: basketResult.data });
}
