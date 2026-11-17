truncate table public.orders, public.contributions, public.basket_items, public.baskets,
  public.needs, public.catalogue_items, public.ngos cascade;

insert into public.ngos (id, name, city, province, mission, registration_number) values
('00000000-0000-4000-8000-000000000001', 'Ubuntu Table Community Kitchen', 'Soweto', 'Gauteng', 'Community meals for local households', 'DEMO-NPO-001'),
('00000000-0000-4000-8000-000000000002', 'Cape Neighbourhood Pantry', 'Khayelitsha', 'Western Cape', 'Weekly household grocery support', 'DEMO-NPO-002'),
('00000000-0000-4000-8000-000000000003', 'eThekwini Family Food Hub', 'Umlazi', 'KwaZulu-Natal', 'Food parcels for families', 'DEMO-NPO-003'),
('00000000-0000-4000-8000-000000000004', 'Mthatha Early Years Pantry', 'Mthatha', 'Eastern Cape', 'Grocery support for caregivers', 'DEMO-NPO-004'),
('00000000-0000-4000-8000-000000000005', 'Mangaung Community Meals', 'Bloemfontein', 'Free State', 'Community meal preparation', 'DEMO-NPO-005');

insert into public.catalogue_items (id, name, pack_label, supplier_name, price_cents, active) values
('00000000-0000-4000-8000-000000000101', 'Maize meal', '25 kg bag', 'Mzansi Bulk Foods', 22000, true),
('00000000-0000-4000-8000-000000000102', 'Cooking oil', '5 L bottle', 'Mzansi Bulk Foods', 11000, true),
('00000000-0000-4000-8000-000000000103', 'Rice', '10 kg bag', 'Mzansi Bulk Foods', 18000, true),
('00000000-0000-4000-8000-000000000104', 'Baked beans', '6 × 410 g cans', 'Mzansi Bulk Foods', 9000, true),
('00000000-0000-4000-8000-000000000105', 'Samp', '10 kg bag', 'Mzansi Bulk Foods', 14000, true),
('00000000-0000-4000-8000-000000000106', 'Dry lentils', '5 kg bag', 'Mzansi Bulk Foods', 16000, true),
('00000000-0000-4000-8000-000000000107', 'Baby formula', '900 g tin', 'Mzansi Bulk Foods', 22000, true),
('00000000-0000-4000-8000-000000000108', 'Oats', '5 kg bag', 'Mzansi Bulk Foods', 11000, true);

insert into public.needs (id, ngo_id, catalogue_item_id, note, week_start, quantity_packs, status) values
('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101', 'For the weekly community meal programme.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000102', 'Cooking oil for meal preparation.', '2026-11-16', 1, 'open'),
('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000103', 'Staple rice packs for household parcels.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000104', 'Canned beans for pantry parcels.', '2026-11-16', 3, 'open'),
('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000105', 'Samp for family meal parcels.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000106', 'Lentils for community meals.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000107', 'Grocery support for caregivers.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000108', 'Oats for pantry parcels.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000103', 'Rice for community meals.', '2026-11-16', 2, 'open'),
('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000102', 'Cooking oil for meal preparation.', '2026-11-16', 1, 'open');

insert into public.baskets (id, ngo_id, status, target_cents, funded_cents, created_at) values
('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'funding', 55000, 40000, '2026-11-16T08:00:00Z');

insert into public.basket_items (id, basket_id, need_id, catalogue_item_id, quantity_packs, unit_price_cents) values
('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 2, 22000),
('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 1, 11000);

insert into public.contributions (id, basket_id, demo_donor_id, amount_cents, status, checkout_key, created_at) values
('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000502', 20000, 'paid', '00000000-0000-4000-8000-000000000701', '2026-11-16T09:00:00Z'),
('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000503', 20000, 'paid', '00000000-0000-4000-8000-000000000702', '2026-11-16T10:00:00Z');
