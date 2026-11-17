-- Developer-run reset for the disposable demo: repeatable, restores exact funding.
begin;
truncate public.orders, public.contributions, public.basket_items, public.baskets,
  public.needs, public.catalogue_items, public.ngos;

insert into public.ngos values
('00000000-0000-4000-8000-000000000001','Ubuntu Table','Soweto','Gauteng','Community meals for local households','DEMO-NPO-001'),
('00000000-0000-4000-8000-000000000002','Cape Neighbourhood Pantry','Khayelitsha','Western Cape','Weekly household grocery support','DEMO-NPO-002'),
('00000000-0000-4000-8000-000000000003','eThekwini Family Food Hub','Umlazi','KwaZulu-Natal','Food parcels for families','DEMO-NPO-003'),
('00000000-0000-4000-8000-000000000004','Mthatha Early Years Pantry','Mthatha','Eastern Cape','Grocery support for caregivers','DEMO-NPO-004'),
('00000000-0000-4000-8000-000000000005','Mangaung Community Meals','Bloemfontein','Free State','Community meal preparation','DEMO-NPO-005');

insert into public.catalogue_items values
('00000000-0000-4000-8000-000000000101','Maize meal','25 kg bag',22000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000102','Cooking oil','5 L bottle',11000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000103','Rice','10 kg bag',18000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000104','Baked beans','6 × 410 g cans',9000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000105','Samp','10 kg bag',14000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000106','Dry lentils','5 kg bag',16000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000107','Baby formula','900 g tin',22000,'Mzansi Bulk Foods (fictional supplier)',true),
('00000000-0000-4000-8000-000000000108','Oats','5 kg bag',11000,'Mzansi Bulk Foods (fictional supplier)',true);

insert into public.needs (id, ngo_id, catalogue_item_id, quantity_packs, note, week_start, status)
select
  ('00000000-0000-4000-8000-' || lpad(need::text,12,'0'))::uuid,
  ('00000000-0000-4000-8000-' || lpad(ngo::text,12,'0'))::uuid,
  ('00000000-0000-4000-8000-' || lpad(item::text,12,'0'))::uuid,
  quantity, 'Weekly grocery support (fictional demo need).', '2026-11-16'::date, 'open'
from (values (201,1,101,2),(202,1,102,1),(203,2,103,2),(204,2,104,3),(205,3,105,2),
  (206,3,106,2),(207,4,107,2),(208,4,108,2),(209,5,103,2),(210,5,102,1)) as fixture(need,ngo,item,quantity);

insert into public.baskets(id,ngo_id,status,target_cents,funded_cents,created_at)
values ('00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000001','funding',55000,40000,'2026-11-16T08:00:00Z');
insert into public.basket_items values
('00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000101',2,22000),
('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000102',1,11000);
insert into public.contributions(id,basket_id,demo_donor_id,amount_cents,status,checkout_key,created_at) values
('00000000-0000-4000-8000-000000000601','00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000502',20000,'paid','00000000-0000-4000-8000-000000000701','2026-11-16T09:00:00Z'),
('00000000-0000-4000-8000-000000000602','00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000503',20000,'paid','00000000-0000-4000-8000-000000000702','2026-11-16T09:00:00Z');
commit;
