import { seedId, SHOWCASE_BASKET_ID, SHOWCASE_NGO_ID } from "./constants";
import type { NGO, CatalogueItem, NeedWithItem, BasketView, Contribution } from "./types";

export const fixtureNgos: NGO[] = [
  { id: seedId(1), name: "Ubuntu Table", city: "Soweto", province: "Gauteng", mission: "Community meals for local households", registration_number: "DEMO-NPO-001" },
  { id: seedId(2), name: "Cape Neighbourhood Pantry", city: "Khayelitsha", province: "Western Cape", mission: "Weekly household grocery support", registration_number: "DEMO-NPO-002" },
  { id: seedId(3), name: "eThekwini Family Food Hub", city: "Umlazi", province: "KwaZulu-Natal", mission: "Food parcels for families", registration_number: "DEMO-NPO-003" },
  { id: seedId(4), name: "Mthatha Early Years Pantry", city: "Mthatha", province: "Eastern Cape", mission: "Grocery support for caregivers", registration_number: "DEMO-NPO-004" },
  { id: seedId(5), name: "Mangaung Community Meals", city: "Bloemfontein", province: "Free State", mission: "Community meal preparation", registration_number: "DEMO-NPO-005" },
];

export const fixtureCatalogue: CatalogueItem[] = [
  ["Maize meal", "25 kg bag", 22000], ["Cooking oil", "5 L bottle", 11000],
  ["Rice", "10 kg bag", 18000], ["Baked beans", "6 × 410 g cans", 9000],
  ["Samp", "10 kg bag", 14000], ["Dry lentils", "5 kg bag", 16000],
  ["Baby formula", "900 g tin", 22000], ["Oats", "5 kg bag", 11000],
].map(([name, pack, cents], i) => ({
  id: seedId(101 + i), name: String(name), pack_label: String(pack), price_cents: Number(cents),
  supplier_name: "Mzansi Bulk Foods (fictional supplier)", active: true,
}));

export const fixtureNeeds: NeedWithItem[] = [
  [1, 101, 2], [1, 102, 1], [2, 103, 2], [2, 104, 3], [3, 105, 2],
  [3, 106, 2], [4, 107, 2], [4, 108, 2], [5, 103, 2], [5, 102, 1],
].map(([ngo, item, quantity], i) => ({
  id: seedId(201 + i), ngo_id: seedId(ngo), catalogue_item_id: seedId(item),
  quantity_packs: quantity, note: "Weekly grocery support (fictional demo need).",
  week_start: "2026-11-16", status: "open", catalogue_item: fixtureCatalogue[item - 101],
}));

export const fixtureBasketView: BasketView = {
  basket: { id: SHOWCASE_BASKET_ID, ngo_id: SHOWCASE_NGO_ID, status: "funding", target_cents: 55000, funded_cents: 40000, created_at: "2026-11-16T08:00:00Z" },
  ngo: fixtureNgos[0], remaining_cents: 15000, order: null,
  items: [0, 1].map((i) => ({
    id: seedId(401 + i), basket_id: SHOWCASE_BASKET_ID, need_id: seedId(201 + i),
    catalogue_item_id: seedId(101 + i), quantity_packs: i === 0 ? 2 : 1,
    unit_price_cents: fixtureCatalogue[i].price_cents, catalogue_item: fixtureCatalogue[i],
  })),
};

export const fixtureContributions: Contribution[] = [0, 1].map((i) => ({
  id: seedId(601 + i), basket_id: SHOWCASE_BASKET_ID, demo_donor_id: seedId(502 + i),
  checkout_key: seedId(701 + i), created_at: "2026-11-16T09:00:00Z", amount_cents: 20000, status: "paid",
}));
