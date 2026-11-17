import type {
  BasketView,
  CatalogueItem,
  Contribution,
  ContributionTracking,
  Need,
  NeedWithItem,
  NGO,
  Order,
} from "@/lib/types";
import { SHOWCASE_BASKET_ID, SHOWCASE_NGO_ID } from "@/lib/constants";

const uuid = (id: number) => `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`;
const supplier_name = "Mzansi Bulk Foods";

export const fixtureNgos: NGO[] = [
  { id: uuid(1), name: "Ubuntu Table Community Kitchen", city: "Soweto", province: "Gauteng", mission: "Community meals for local households", registration_number: "DEMO-NPO-001" },
  { id: uuid(2), name: "Cape Neighbourhood Pantry", city: "Khayelitsha", province: "Western Cape", mission: "Weekly household grocery support", registration_number: "DEMO-NPO-002" },
  { id: uuid(3), name: "eThekwini Family Food Hub", city: "Umlazi", province: "KwaZulu-Natal", mission: "Food parcels for families", registration_number: "DEMO-NPO-003" },
  { id: uuid(4), name: "Mthatha Early Years Pantry", city: "Mthatha", province: "Eastern Cape", mission: "Grocery support for caregivers", registration_number: "DEMO-NPO-004" },
  { id: uuid(5), name: "Mangaung Community Meals", city: "Bloemfontein", province: "Free State", mission: "Community meal preparation", registration_number: "DEMO-NPO-005" },
];

export const fixtureCatalogue: CatalogueItem[] = [
  ["Maize meal", "25 kg bag", 22000], ["Cooking oil", "5 L bottle", 11000],
  ["Rice", "10 kg bag", 18000], ["Baked beans", "6 × 410 g cans", 9000],
  ["Samp", "10 kg bag", 14000], ["Dry lentils", "5 kg bag", 16000],
  ["Baby formula", "900 g tin", 22000], ["Oats", "5 kg bag", 11000],
].map(([name, pack_label, price_cents], index) => ({
  id: uuid(101 + index),
  name: String(name),
  pack_label: String(pack_label),
  price_cents: Number(price_cents),
  supplier_name,
  active: true,
}));

const needRows: Array<[number, number, number, string]> = [
  [1, 101, 2, "For the weekly community meal programme."], [1, 102, 1, "Cooking oil for meal preparation."],
  [2, 103, 2, "Staple rice packs for household parcels."], [2, 104, 3, "Canned beans for pantry parcels."],
  [3, 105, 2, "Samp for family meal parcels."], [3, 106, 2, "Lentils for community meals."],
  [4, 107, 2, "Grocery support for caregivers."], [4, 108, 2, "Oats for pantry parcels."],
  [5, 103, 2, "Rice for community meals."], [5, 102, 1, "Cooking oil for meal preparation."],
];

export const fixtureNeeds: Need[] = needRows.map(([ngo, catalogue, quantity, note], index) => ({
  id: uuid(201 + index),
  ngo_id: uuid(ngo),
  catalogue_item_id: uuid(catalogue),
  note,
  week_start: "2026-11-16",
  quantity_packs: quantity,
  status: "open",
}));

export const fixtureNeedsWithItems: NeedWithItem[] = fixtureNeeds.map((need) => ({
  ...need,
  catalogue_item: fixtureCatalogue.find((item) => item.id === need.catalogue_item_id)!,
}));

export const fixtureOrder: Order | null = null;

export const fixtureBasketView: BasketView = {
  basket: {
    id: SHOWCASE_BASKET_ID,
    ngo_id: SHOWCASE_NGO_ID,
    created_at: "2026-11-16T08:00:00.000Z",
    status: "funding",
    target_cents: 55000,
    funded_cents: 40000,
  },
  ngo: fixtureNgos[0],
  items: [
    { id: uuid(401), basket_id: SHOWCASE_BASKET_ID, need_id: uuid(201), catalogue_item_id: uuid(101), quantity_packs: 2, unit_price_cents: 22000, catalogue_item: fixtureCatalogue[0] },
    { id: uuid(402), basket_id: SHOWCASE_BASKET_ID, need_id: uuid(202), catalogue_item_id: uuid(102), quantity_packs: 1, unit_price_cents: 11000, catalogue_item: fixtureCatalogue[1] },
  ],
  remaining_cents: 15000,
  order: fixtureOrder,
};

export const fixtureContributions: Contribution[] = [1, 2].map((id) => ({
  id: uuid(600 + id),
  basket_id: SHOWCASE_BASKET_ID,
  demo_donor_id: uuid(500 + id),
  checkout_key: uuid(700 + id),
  created_at: `2026-11-16T0${id}:00:00.000Z`,
  amount_cents: 20000,
  status: "paid",
}));

export const fixtureContributionTracking: ContributionTracking = {
  contribution: fixtureContributions[0],
  basket_view: fixtureBasketView,
};

export function getFixtureNgo(id: string): NGO | undefined {
  return fixtureNgos.find((ngo) => ngo.id === id);
}
