export type BasketStatus = "funding" | "funded";
export type ContributionStatus = "paid";
export type OrderStatus = "awaiting_delivery" | "delivered";
export type NeedStatus = "open" | "fulfilled";

export type NGO = {
  id: string;
  name: string;
  city: string;
  province: string;
  mission: string;
  registration_number: string;
};

export type CatalogueItem = {
  id: string;
  name: string;
  pack_label: string;
  supplier_name: string;
  price_cents: number;
  active: boolean;
};

export type Need = {
  id: string;
  ngo_id: string;
  catalogue_item_id: string;
  note: string;
  week_start: string;
  quantity_packs: number;
  status: NeedStatus;
};

export type Basket = {
  id: string;
  ngo_id: string;
  created_at: string;
  status: BasketStatus;
  target_cents: number;
  funded_cents: number;
};

export type BasketItem = {
  id: string;
  basket_id: string;
  need_id: string;
  catalogue_item_id: string;
  quantity_packs: number;
  unit_price_cents: number;
};

export type Contribution = {
  id: string;
  basket_id: string;
  demo_donor_id: string;
  checkout_key: string;
  created_at: string;
  amount_cents: number;
  status: ContributionStatus;
};

export type Order = {
  id: string;
  basket_id: string;
  created_at: string;
  status: OrderStatus;
  proof_photo_path: string | null;
  receipt_note: string | null;
  delivered_at: string | null;
};

export type ContributionResult = {
  contribution_id: string;
  basket_id: string;
  amount_cents: number;
  funded_cents: number;
  target_cents: number;
  basket_status: BasketStatus;
  order_id: string | null;
};

export type NeedWithItem = Need & { catalogue_item: CatalogueItem };

export type BasketView = {
  basket: Basket;
  ngo: NGO;
  items: (BasketItem & { catalogue_item: CatalogueItem })[];
  remaining_cents: number;
  order: Order | null;
};

export type ContributionTracking = {
  contribution: Contribution;
  basket_view: BasketView;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export type Database = {
  public: {
    Tables: {
      ngos: Table<NGO>;
      catalogue_items: Table<CatalogueItem>;
      needs: Table<Need>;
      baskets: Table<Basket>;
      basket_items: Table<BasketItem>;
      contributions: Table<Contribution>;
      orders: Table<Order>;
    };
    Views: Record<string, never>;
    Functions: {
      contribute_to_basket: {
        Args: {
          p_basket_id: string;
          p_demo_donor_id: string;
          p_amount_cents: number;
          p_checkout_key: string;
        };
        Returns: ContributionResult;
      };
      confirm_delivery: {
        Args: { p_order_id: string; p_proof_path: string; p_note: string };
        Returns: Order;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
