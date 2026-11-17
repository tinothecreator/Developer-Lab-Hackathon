create extension if not exists pgcrypto;

create table if not exists public.ngos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  province text not null,
  mission text not null,
  registration_number text not null
);

create table if not exists public.catalogue_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pack_label text not null,
  supplier_name text not null,
  price_cents integer not null check (price_cents > 0),
  active boolean not null default true
);

create table if not exists public.needs (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.ngos(id) on delete cascade,
  catalogue_item_id uuid not null references public.catalogue_items(id),
  note text not null,
  week_start date not null,
  quantity_packs integer not null check (quantity_packs > 0),
  status text not null default 'open' check (status in ('open', 'fulfilled'))
);

create table if not exists public.baskets (
  id uuid primary key default gen_random_uuid(),
  ngo_id uuid not null references public.ngos(id),
  created_at timestamptz not null default now(),
  status text not null default 'funding' check (status in ('funding', 'funded')),
  target_cents integer not null check (target_cents > 0),
  funded_cents integer not null default 0 check (funded_cents >= 0 and funded_cents <= target_cents)
);

create unique index if not exists baskets_one_funding_basket_per_ngo
  on public.baskets(ngo_id) where status = 'funding';

create table if not exists public.basket_items (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid not null references public.baskets(id) on delete cascade,
  need_id uuid not null references public.needs(id),
  catalogue_item_id uuid not null references public.catalogue_items(id),
  quantity_packs integer not null check (quantity_packs > 0),
  unit_price_cents integer not null check (unit_price_cents > 0)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid not null references public.baskets(id),
  demo_donor_id uuid not null,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'paid' check (status = 'paid'),
  checkout_key uuid not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  basket_id uuid not null unique references public.baskets(id),
  status text not null default 'awaiting_delivery' check (status in ('awaiting_delivery', 'delivered')),
  proof_photo_path text,
  receipt_note text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint delivered_order_has_receipt check (
    status <> 'delivered'
    or (proof_photo_path is not null and receipt_note is not null
      and length(trim(receipt_note)) between 1 and 280 and delivered_at is not null)
  )
);

alter table public.ngos enable row level security;
alter table public.catalogue_items enable row level security;
alter table public.needs enable row level security;
alter table public.baskets enable row level security;
alter table public.basket_items enable row level security;
alter table public.contributions enable row level security;
alter table public.orders enable row level security;

drop policy if exists "demo anon reads ngos" on public.ngos;
create policy "demo anon reads ngos" on public.ngos for select to anon using (true);
drop policy if exists "demo anon reads catalogue" on public.catalogue_items;
create policy "demo anon reads catalogue" on public.catalogue_items for select to anon using (true);
drop policy if exists "demo anon reads needs" on public.needs;
create policy "demo anon reads needs" on public.needs for select to anon using (true);
drop policy if exists "demo anon reads baskets" on public.baskets;
create policy "demo anon reads baskets" on public.baskets for select to anon using (true);
drop policy if exists "demo anon reads basket items" on public.basket_items;
create policy "demo anon reads basket items" on public.basket_items for select to anon using (true);
drop policy if exists "demo anon reads contributions" on public.contributions;
create policy "demo anon reads contributions" on public.contributions for select to anon using (true);
drop policy if exists "demo anon reads orders" on public.orders;
create policy "demo anon reads orders" on public.orders for select to anon using (true);

grant usage on schema public to anon;
grant select on public.ngos, public.catalogue_items, public.needs, public.baskets,
  public.basket_items, public.contributions, public.orders to anon;
revoke insert, update, delete, truncate, references, trigger on public.baskets, public.contributions, public.orders from anon;

create or replace function public.contribute_to_basket(
  p_basket_id uuid,
  p_demo_donor_id uuid,
  p_amount_cents integer,
  p_checkout_key uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_basket public.baskets%rowtype;
  v_existing public.contributions%rowtype;
  v_contribution public.contributions%rowtype;
  v_order_id uuid;
begin
  if p_basket_id is null or p_demo_donor_id is null or p_checkout_key is null
    or p_amount_cents is null or p_amount_cents <= 0 then
    raise exception using message = 'INVALID_AMOUNT';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_checkout_key::text, 0));

  select * into v_basket
  from public.baskets
  where id = p_basket_id
  for update;

  if not found then
    raise exception using message = 'UNKNOWN';
  end if;

  select * into v_existing
  from public.contributions
  where checkout_key = p_checkout_key;

  if found then
    if v_existing.basket_id <> p_basket_id
      or v_existing.demo_donor_id <> p_demo_donor_id
      or v_existing.amount_cents <> p_amount_cents then
      raise exception using message = 'KEY_REUSED';
    end if;

    select id into v_order_id from public.orders where basket_id = p_basket_id;
    return jsonb_build_object(
      'contribution_id', v_existing.id,
      'basket_id', v_basket.id,
      'amount_cents', v_existing.amount_cents,
      'funded_cents', v_basket.funded_cents,
      'target_cents', v_basket.target_cents,
      'basket_status', v_basket.status,
      'order_id', v_order_id
    );
  end if;

  if v_basket.status <> 'funding' then
    raise exception using message = 'BASKET_FULL';
  end if;

  if p_amount_cents > v_basket.target_cents - v_basket.funded_cents then
    raise exception using message = 'OVERFUNDED';
  end if;

  insert into public.contributions (basket_id, demo_donor_id, amount_cents, checkout_key)
  values (p_basket_id, p_demo_donor_id, p_amount_cents, p_checkout_key)
  returning * into v_contribution;

  update public.baskets
  set funded_cents = funded_cents + p_amount_cents,
      status = case when funded_cents + p_amount_cents = target_cents then 'funded' else 'funding' end
  where id = p_basket_id
  returning * into v_basket;

  if v_basket.status = 'funded' then
    insert into public.orders (basket_id) values (p_basket_id)
    on conflict (basket_id) do nothing
    returning id into v_order_id;
    if v_order_id is null then
      select id into v_order_id from public.orders where basket_id = p_basket_id;
    end if;
  end if;

  return jsonb_build_object(
    'contribution_id', v_contribution.id,
    'basket_id', v_basket.id,
    'amount_cents', v_contribution.amount_cents,
    'funded_cents', v_basket.funded_cents,
    'target_cents', v_basket.target_cents,
    'basket_status', v_basket.status,
    'order_id', v_order_id
  );
end;
$$;

revoke all on function public.contribute_to_basket(uuid, uuid, integer, uuid) from public, anon, authenticated;
grant execute on function public.contribute_to_basket(uuid, uuid, integer, uuid) to anon, authenticated;

create or replace function public.confirm_delivery(
  p_order_id uuid,
  p_proof_path text,
  p_note text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_note text;
begin
  v_note := trim(coalesce(p_note, ''));
  if p_order_id is null then
    raise exception using message = 'NOT_AWAITING_DELIVERY';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'awaiting_delivery' then
    raise exception using message = 'NOT_AWAITING_DELIVERY';
  end if;

  if p_proof_path is null or p_proof_path not like p_order_id::text || '/%' then
    raise exception using message = 'UPLOAD_FAILED';
  end if;
  if length(v_note) not between 1 and 280 then
    raise exception using message = 'UNKNOWN';
  end if;

  perform 1
  from public.storage.objects
  where bucket_id = 'delivery-proofs'
    and name = p_proof_path
    and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
    and coalesce(metadata->>'size', '') ~ '^[0-9]+$'
    and (metadata->>'size')::bigint <= 5242880;
  if not found then
    raise exception using message = 'UPLOAD_FAILED';
  end if;

  update public.orders
  set status = 'delivered',
      proof_photo_path = p_proof_path,
      receipt_note = v_note,
      delivered_at = now()
  where id = p_order_id
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke all on function public.confirm_delivery(uuid, text, text) from public, anon, authenticated;
grant execute on function public.confirm_delivery(uuid, text, text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('delivery-proofs', 'delivery-proofs', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "demo reads delivery proofs" on storage.objects;
create policy "demo reads delivery proofs" on storage.objects for select to anon
using (bucket_id = 'delivery-proofs');

drop policy if exists "demo uploads order proofs" on storage.objects;
create policy "demo uploads order proofs" on storage.objects for insert to anon
with check (
  bucket_id = 'delivery-proofs'
  and name ~ '^[0-9a-fA-F-]{36}/[0-9a-fA-F-]{36}\.(jpg|png|webp)$'
  and coalesce(metadata->>'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
  and coalesce(metadata->>'size', '') ~ '^[0-9]+$'
  and (metadata->>'size')::bigint <= 5242880
  and exists (
    select 1 from public.orders
    where id::text = (storage.foldername(name))[1]
      and status = 'awaiting_delivery'
  )
);

grant select, insert on storage.objects to anon;
grant usage on schema storage to anon;
