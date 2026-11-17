begin;

create table public.ngos (
  id uuid primary key, name text not null, city text not null, province text not null,
  mission text not null, registration_number text not null
);
create table public.catalogue_items (
  id uuid primary key, name text not null, pack_label text not null,
  price_cents integer not null check (price_cents > 0), supplier_name text not null,
  active boolean not null default true
);
create table public.needs (
  id uuid primary key, ngo_id uuid not null references public.ngos,
  catalogue_item_id uuid not null references public.catalogue_items,
  quantity_packs integer not null check (quantity_packs > 0), note text not null,
  week_start date not null, status text not null default 'open' check (status in ('open', 'fulfilled'))
);
create table public.baskets (
  id uuid primary key default gen_random_uuid(), ngo_id uuid not null references public.ngos,
  status text not null default 'funding' check (status in ('funding', 'funded')),
  target_cents integer not null check (target_cents > 0),
  funded_cents integer not null default 0 check (funded_cents >= 0 and funded_cents <= target_cents),
  created_at timestamptz not null default now(),
  check ((status = 'funded') = (funded_cents = target_cents))
);
create unique index one_funding_basket_per_ngo on public.baskets(ngo_id) where status = 'funding';
create table public.basket_items (
  id uuid primary key, basket_id uuid not null references public.baskets,
  need_id uuid not null references public.needs, catalogue_item_id uuid not null references public.catalogue_items,
  quantity_packs integer not null check (quantity_packs > 0),
  unit_price_cents integer not null check (unit_price_cents > 0)
);
create table public.contributions (
  id uuid primary key default gen_random_uuid(), basket_id uuid not null references public.baskets,
  demo_donor_id uuid not null, amount_cents integer not null check (amount_cents > 0),
  status text not null default 'paid' check (status = 'paid'), checkout_key uuid not null unique,
  created_at timestamptz not null default now()
);
create index contributions_basket_idx on public.contributions(basket_id);
create table public.orders (
  id uuid primary key default gen_random_uuid(), basket_id uuid not null unique references public.baskets,
  status text not null default 'awaiting_delivery' check (status in ('awaiting_delivery', 'delivered')),
  proof_photo_path text, receipt_note text, delivered_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'awaiting_delivery' and proof_photo_path is null and receipt_note is null and delivered_at is null)
    or (status = 'delivered' and proof_photo_path is not null and delivered_at is not null
      and receipt_note is not null and char_length(btrim(receipt_note)) between 1 and 280
      and receipt_note = btrim(receipt_note))
  )
);

-- Public read access is intentional for this disposable fictional demo.
-- The UI role switch is not authorisation. There are NO anonymous write policies.
do $$
declare table_name text;
begin
  foreach table_name in array array['ngos','catalogue_items','needs','baskets','basket_items','contributions','orders'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('create policy demo_read on public.%I for select to anon, authenticated using (true)', table_name);
  end loop;
end $$;
grant usage on schema public to anon, authenticated;

create function public.contribute_to_basket(
  p_basket_id uuid, p_demo_donor_id uuid, p_amount_cents integer, p_checkout_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_basket public.baskets%rowtype;
  saved_contribution public.contributions%rowtype;
  resulting_order_id uuid;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception using message = 'INVALID_AMOUNT', detail = 'Choose a positive amount in integer cents.';
  end if;
  if p_checkout_key is null or p_basket_id is null or p_demo_donor_id is null then
    raise exception using message = 'UNKNOWN', detail = 'A basket, donor and checkout key are required.';
  end if;

  -- Serialize the same key even if a changed payload targets a different basket.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_checkout_key::text, 0));
  select * into current_basket from public.baskets where id = p_basket_id for update;

  select * into saved_contribution from public.contributions where checkout_key = p_checkout_key;
  if found then
    if saved_contribution.basket_id <> p_basket_id
      or saved_contribution.demo_donor_id <> p_demo_donor_id
      or saved_contribution.amount_cents <> p_amount_cents then
      raise exception using message = 'KEY_REUSED', detail = 'This checkout key belongs to a different attempt.';
    end if;
    -- Replay precedes the funded-basket rejection and returns CURRENT totals/order.
  else
    if current_basket.id is null then
      raise exception using message = 'UNKNOWN', detail = 'Basket not found.';
    end if;
    if current_basket.status <> 'funding' then
      raise exception using message = 'BASKET_FULL', detail = 'This basket is fully funded.';
    end if;
    if p_amount_cents > current_basket.target_cents - current_basket.funded_cents then
      raise exception using message = 'OVERFUNDED', detail = 'The contribution exceeds the remaining balance.';
    end if;
    insert into public.contributions(basket_id, demo_donor_id, amount_cents, checkout_key)
      values (p_basket_id, p_demo_donor_id, p_amount_cents, p_checkout_key)
      returning * into saved_contribution;
    update public.baskets set
      funded_cents = funded_cents + p_amount_cents,
      status = case when funded_cents + p_amount_cents = target_cents then 'funded' else 'funding' end
      where id = p_basket_id returning * into current_basket;
    if current_basket.funded_cents = current_basket.target_cents then
      insert into public.orders(basket_id) values (p_basket_id);
    end if;
  end if;

  select id into resulting_order_id from public.orders where basket_id = p_basket_id;
  return jsonb_build_object(
    'contribution_id', saved_contribution.id, 'basket_id', current_basket.id,
    'amount_cents', saved_contribution.amount_cents, 'funded_cents', current_basket.funded_cents,
    'target_cents', current_basket.target_cents, 'basket_status', current_basket.status,
    'order_id', resulting_order_id
  );
end $$;
revoke all on function public.contribute_to_basket(uuid, uuid, integer, uuid) from public;
grant execute on function public.contribute_to_basket(uuid, uuid, integer, uuid) to anon, authenticated;

-- Receipt writes use a narrow RPC rather than a general UPDATE policy.
create function public.confirm_delivery(p_order_id uuid, p_proof_path text, p_note text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_order public.orders%rowtype;
begin
  select * into current_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception using message = 'NOT_AWAITING_DELIVERY', detail = 'No awaiting-delivery order was found.';
  end if;
  if p_note is null or char_length(btrim(p_note)) not between 1 and 280 then
    raise exception using message = 'UNKNOWN', detail = 'Receipt note must contain 1–280 characters.';
  end if;
  if p_proof_path is null or p_proof_path !~ (
    '^' || p_order_id::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
  ) then
    raise exception using message = 'UPLOAD_FAILED', detail = 'Upload a valid proof photo for this order first.';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'delivery-proofs' and name = p_proof_path) then
    raise exception using message = 'UPLOAD_FAILED', detail = 'The uploaded proof could not be found.';
  end if;
  -- An uncertain response can safely retry its exact saved receipt.
  if current_order.status = 'delivered' and current_order.proof_photo_path = p_proof_path
    and current_order.receipt_note = btrim(p_note) then
    return to_jsonb(current_order);
  end if;
  if current_order.status <> 'awaiting_delivery' then
    raise exception using message = 'NOT_AWAITING_DELIVERY', detail = 'Receipt has already been confirmed.';
  end if;
  update public.orders set status = 'delivered', proof_photo_path = p_proof_path,
    receipt_note = btrim(p_note), delivered_at = now()
    where id = p_order_id returning * into current_order;
  return to_jsonb(current_order);
end $$;
revoke all on function public.confirm_delivery(uuid, text, text) from public;
grant execute on function public.confirm_delivery(uuid, text, text) to anon, authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('delivery-proofs', 'delivery-proofs', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy demo_proof_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'delivery-proofs');
create policy demo_proof_upload on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'delivery-proofs'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
    and exists (select 1 from public.orders where id::text = split_part(name, '/', 1) and status = 'awaiting_delivery')
  );
-- No UPDATE/DELETE policy: proof uploads cannot overwrite existing evidence.

commit;
