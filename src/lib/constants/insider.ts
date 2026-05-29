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
  cart_to_wishlist: "item_added_to_wishlist",
  home: "home",
  login: "login",
  logout: "logout",
  my_wishlist: "wishlist_view",
  other: "other",
  purchase: "purchase",
  remove_from_wishlist: "item_removed_from_wishlist",
  search_freetext: "search",
  search_recent: "search",
  search_suggestion: "search",
  signup: "sign_up_confirmation",
  view_cart: "cart",
  view_category: "category",
  view_product: "product",
};

export const INSIDER_CUSTOM_EVENTS: string[] = [
  "cart_clear",
  "cart_to_wishlist",
  "add_to_wishlist",
  "checkout_init",
  "login",
  "my_wishlist",
  "remove_from_wishlist",
  "search_freetext",
  "search_recent",
  "search_suggestion",
  "signup",
];

export const INSIDER_DEFAULT_EVENTS: string[] = [
  "home",
  "purchase",
  "view_cart",
  "view_category",
  "view_product",
];

export const INSIDER_OTHER_EVENTS: string[] = [
  "cart_lessqty",
  "cart_moreqty",
  "edit_profile",
  "langauge_pick",
  "profile_updated",
  "view_account",
  "add_to_cart",
  "cart_remove",
];

export const INSIDER_EXCLUDE_EVENT_PROPERTIES: string[] = [
  "cart_clear",
  "checkout_init",
  "login",
  "logout",
  "signup",
];

export const SEARCH_EVENTS: string[] = [
  "search_freetext",
  "search_recent",
  "search_suggestion",
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
