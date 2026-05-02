import { CustomerProperties } from "@/lib/analytics/utils/build-properties";

export const INSIDER_CUSTOMER_KEY_MAP: Record<
  string,
  keyof CustomerProperties
> = {
  "user.age": "dateOfBirth",
  "user.email": "email",
  "user.gender": "gender",
  "user.id": "id",
  "user.name": "fullName",
  "user.phone": "phoneNumber",
  "user.uuid": "uuid",
  "user.wallet_points": "rewardPointsBalance",
};

export const INSIDER_EVENT_NAME_MAPPING: Record<string, string> = {
  add_to_cart: "add_to_cart",
  add_to_wishlist: "item_added_to_wishlist",
  cart_clear: "cart_clear",
  cart_remove: "remove_from_cart",
  home: "home",
  login: "login",
  logout: "logout",
  my_wishlist: "wishlist_view",
  purchase: "purchase",
  remove_from_wishlist: "item_removed_from_wishlist",
  signup: "sign_up_confirmation",
  view_cart: "cart",
  view_product: "product",
};

export const INSIDER_EXCLUDE_EVENT_PROPERTIES: string[] = [
  "cart_clear",
  "checkout_init",
  "login",
  "logout",
  "signup",
];

export const INSIDER_STORE_CONFIG: Record<
  string,
  { currency: string; lang: string }
> = {
  "ar-AE": { currency: "AED", lang: "ar" },
  "ar-GLOBAL": { currency: "USD", lang: "ar" },
  "ar-IQ": { currency: "IQD", lang: "ar" },
  "ar-KW": { currency: "KWD", lang: "ar" },
  "ar-OM": { currency: "OMR", lang: "ar" },
  "ar-SA": { currency: "SAR", lang: "ar" },
  "en-AE": { currency: "AED", lang: "en" },
  "en-GLOBAL": { currency: "USD", lang: "en" },
  "en-IQ": { currency: "IQD", lang: "en" },
  "en-KW": { currency: "KWD", lang: "en" },
  "en-OM": { currency: "OMR", lang: "en" },
  "en-SA": { currency: "SAR", lang: "en" },
} as const;
