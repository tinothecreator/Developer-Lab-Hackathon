-- Run after seed.sql. Every mutation rolls back, leaving R400 / R550.
begin;
set local role anon;
do $$
<<funding_smoke>>
declare
  basket_id constant uuid := '00000000-0000-4000-8000-000000000301';
  donor_id constant uuid := '00000000-0000-4000-8000-000000000501';
  first_key constant uuid := '00000000-0000-4000-8000-000000000801';
  second_key constant uuid := '00000000-0000-4000-8000-000000000802';
  first_result jsonb;
  replay jsonb;
  full_result jsonb;
  failed boolean;
begin
  assert (select funded_cents = 40000 and target_cents = 55000 from public.baskets where id = basket_id), 'Reset the seed before smoke testing';
  assert (select count(*) = 0 from public.orders), 'Seed must have no orders';
  assert (select count(*) = 5 from public.ngos), 'Five demo NGOs required';

  first_result := public.contribute_to_basket(basket_id, donor_id, 5000, first_key);
  assert (first_result->>'funded_cents')::integer = 45000, 'R50 must reach R450';
  assert first_result->>'order_id' is null, 'No order before full funding';
  replay := public.contribute_to_basket(basket_id, donor_id, 5000, first_key);
  assert replay->>'contribution_id' = first_result->>'contribution_id', 'Replay must return the same contribution';
  assert (select count(*) = 3 from public.contributions), 'Replay must not insert another contribution';

  failed := false;
  begin
    perform public.contribute_to_basket(basket_id, donor_id, 10001, gen_random_uuid());
  exception when raise_exception then
    if sqlerrm <> 'OVERFUNDED' then raise; end if;
    failed := true;
  end;
  assert failed, 'Overfunding must fail';
  assert (select funded_cents = 45000 from public.baskets where id = basket_id), 'Rejected amount must not change funding';
  assert (select count(*) = 0 from public.orders), 'Rejected amount must not create an order';

  failed := false;
  begin
    perform public.contribute_to_basket(basket_id, donor_id, 6000, first_key);
  exception when raise_exception then
    if sqlerrm <> 'KEY_REUSED' then raise; end if;
    failed := true;
  end;
  assert failed, 'Changed payload must reject a reused key';

  failed := false;
  begin
    perform public.contribute_to_basket(basket_id, donor_id, 0, gen_random_uuid());
  exception when raise_exception then
    if sqlerrm <> 'INVALID_AMOUNT' then raise; end if;
    failed := true;
  end;
  assert failed, 'Zero amount must fail';

  full_result := public.contribute_to_basket(basket_id, donor_id, 10000, second_key);
  assert (full_result->>'funded_cents')::integer = 55000, 'R100 must reach R550';
  assert full_result->>'basket_status' = 'funded', 'Full basket must be funded';
  assert (select count(*) = 1 from public.orders where orders.basket_id = funding_smoke.basket_id), 'Exactly one order required';
  replay := public.contribute_to_basket(basket_id, donor_id, 5000, first_key);
  assert replay->>'contribution_id' = first_result->>'contribution_id', 'Replay must work after full funding';
  assert replay->>'order_id' = full_result->>'order_id', 'Replay must return current shared order';
  replay := public.contribute_to_basket(basket_id, donor_id, 10000, second_key);
  assert (select count(*) = 4 from public.contributions), 'Full funding replay must not duplicate';

  failed := false;
  begin
    perform public.contribute_to_basket(basket_id, donor_id, 1, gen_random_uuid());
  exception when raise_exception then
    if sqlerrm <> 'BASKET_FULL' then raise; end if;
    failed := true;
  end;
  assert failed, 'Full basket must reject new funding';

  failed := false;
  begin
    perform public.confirm_delivery((full_result->>'order_id')::uuid,
      (full_result->>'order_id') || '/00000000-0000-4000-8000-000000000901.png', 'Demo groceries received.');
  exception when raise_exception then
    if sqlerrm <> 'UPLOAD_FAILED' then raise; end if;
    failed := true;
  end;
  assert failed, 'Receipt requires an existing uploaded photo';
  assert (select status = 'awaiting_delivery' from public.orders where id = (full_result->>'order_id')::uuid), 'Failed receipt must not deliver';

  failed := false;
  begin
    insert into public.contributions(basket_id,demo_donor_id,amount_cents,checkout_key) values (basket_id,donor_id,1,gen_random_uuid());
  exception when insufficient_privilege then failed := true;
  end;
  assert failed, 'Direct anonymous contribution writes must be denied';
  failed := false;
  begin update public.baskets set funded_cents = 55000 where id = basket_id;
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'Direct anonymous basket updates must be denied';
  failed := false;
  begin update public.orders set receipt_note = 'Bypass' where id = (full_result->>'order_id')::uuid;
  exception when insufficient_privilege then failed := true; end;
  assert failed, 'Direct anonymous order updates must be denied';
  raise notice 'PASS: R50, replay, invalid/overfunded/reused keys, R100, one order, funded replay, receipt safeguards and anon write denial';
end $$;
rollback;
