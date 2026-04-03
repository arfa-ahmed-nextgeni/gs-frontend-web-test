// Cart model - insider cart view properties
export interface CartInsiderProperties {
  items: CartItemInsiderProperties[];
  shipping_cost: number;
  total: number;
}

export interface CartItemInsiderProperties {
  color: string;
  custom?: {
    brnd: string;
    groupcode: string;
    iis: boolean;
    is_gwp: boolean;
    parent_product_integer_id: string;
    product_integer_id: string;
    pt: string;
  };
  id: string;
  name: string;
  product_image_url: string;
  quantity: number;
  size: string;
  stock: number;
  taxonomy: string[];
  unit_price: number;
  unit_sale_price: number;
  url: string;
}

// Cart model
export interface CartProperties {
  "cart.discounts"?: number;
  "cart.fees_COD"?: number;
  "cart.fees_shipping"?: number;
  "cart.gift_wrap_applied"?: boolean;
  "cart.gift_wrap.currency"?: string;
  "cart.gift_wrap.id"?: string;
  "cart.gift_wrap.name"?: string;
  "cart.gift_wrap.price"?: number;
  "cart.grandTotal"?: number;
  "cart.promo_code"?: string;
  "cart.subtotal"?: number;
  "cart.total"?: number;
  express_delivery_available?: boolean;
  item_ids?: string;
}

// Category items sold events (cat_beauty_items_sold, cat_fragrance_items_sold, cat_mix_items_sold)
export interface CategoryItemsSoldProperties {
  item_count?: number;
  item_ids?: string;
  order_id?: string;
  total?: number;
}

// Category model
export interface CategoryProperties {
  "category.english_name"?: string;
  "category.id": string;
  "category.level"?: number;
  "category.name": string;
  "category.parent_name"?: string;
}

export interface CategoryTabClickOrigin {
  level1: number;
  level2: number;
  origin: "category_tab";
  position: number;
}

export type ClickOrigin =
  | CategoryTabClickOrigin
  | LpClickOrigin
  | PlpClickOrigin
  | SearchClickOrigin
  | TopMenuClickOrigin;

export interface DesktopNavigationProperties extends LpProperties {
  category_id?: string;
  title?: string;
  url_type?: DesktopNavigationUrlType;
}

// Desktop navigation event properties
export type DesktopNavigationUrlType = "brands" | "category" | "lp";

export interface LpClickOrigin {
  column: number;
  extra?: Record<string, unknown>;
  inner_position?: number;
  origin: "lp";
  row: number;
}

// Lp (Landing Page) model
export interface LpProperties {
  lp_id: string;
  lp_name: string;
  type: string;
}

// Order model (extends Cart)
export interface OrderProperties extends CartProperties {
  payment_method: string;
}

export interface PlpClickOrigin {
  categoryId: number;
  origin: "plp";
  position: number;
}

// Product model - insider product view properties
export interface ProductInsiderProperties {
  color: string;
  custom: {
    attribute_set: string;
    brnd: string;
    groupcode: string;
    iis: boolean;
    parent_product_integer_id: string;
    product_integer_id: string;
    pt: string;
  };
  id: string;
  name: string;
  product_image_url: string;
  size: string;
  stock: number;
  taxonomy: string[];
  unit_price: number;
  unit_sale_price: number;
  url: string;
}

// Product List model - products grouped by SKU
// Keys are dynamic: product.{SKU}.id, product.{SKU}.name, etc.
// Using Record<string, unknown> to allow dynamic SKU-based keys
export interface ProductListProperties extends Record<string, unknown> {
  // These are examples of the expected key patterns, but any key matching product.{SKU}.* is allowed
  [key: string]: unknown;
}

// Product model (extends Category)
export interface ProductProperties extends CategoryProperties {
  "product.attribute_set"?: string;
  "product.brand": string;
  "product.brand_id": string;
  "product.color"?: string;
  "product.id": string;
  "product.image_url"?: string;
  "product.name": string;
  "product.parent_id"?: string;
  "product.price": number;
  "product.sale_price"?: number;
  "product.size"?: string;
  "product.sku": string;
  "product.sku_parent"?: string;
  "product.stock"?: number;
  "product.type": string;
  "product.url"?: string;
}

// Purchase event properties (specific to purchase event)
export interface PurchaseProperties {
  item_ids?: string;
  order_id?: string;
  "order.fees_COD"?: number;
  "order.fees_shipping"?: number;
  "order.grandTotal"?: number;
  "order.id"?: string;
  "order.payment_method"?: string;
  "order.subtotal"?: number;
  shipping_type?: "Click Collect" | "Home Delivery";
}

// Rate model
export interface RateProperties {
  "rate.value": number;
}

export interface SearchClickOrigin {
  origin: "search";
  position: number;
  term: string;
}

// Store model
export interface StoreProperties {
  country: string;
  Language: string;
}

// Click Origin types for internal source tracking
export interface TopMenuClickOrigin {
  lp_id?: string;
  origin: "top_menu";
  position: number;
  vertical?: "Beauty" | "Fragrances";
}

// User model - sent as insider user properties
export interface UserInsiderProperties {
  age: number;
  birthday: string;
  custom: Record<string, unknown>;
  email: string;
  email_optin: boolean;
  gdpr_optin: boolean;
  gender: string;
  name: string;
  phone_number: string;
  sms_optin: boolean;
  surname: string;
  uuid: string;
  whatsapp_optin: boolean;
}

// User model - sent as Amplitude user properties
export interface UserProperties {
  "user.age": string;
  "user.email": string;
  "user.gender": string;
  "user.id": string;
  "user.name": string;
  "user.phone": string;
  "user.uuid": string;
  "user.wallet_points": number;
}

// View model
export interface ViewProperties {
  "view.page_id"?: string;
  "view.page_name": string;
  "view.page_type":
    | "account_area"
    | "cart"
    | "catalog"
    | "category"
    | "checkout"
    | "failure"
    | "order_history"
    | "product"
    | "success";
}
