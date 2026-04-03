import { LockerType } from "@/lib/constants/checkout/locker-locations";

export const QUERY_KEYS = {
  APPLE_PAY: {
    AVAILABILITY: (merchantIdentifier: string) => [
      "apple-pay",
      "availability",
      merchantIdentifier,
    ],
  },

  CART: {
    FULL: (locale: string) => ["cart", locale, "full"],
    PAGINATED: (locale: string, page: number, pageSize: number) => [
      "cart",
      locale,
      "paginated",
      page,
      pageSize,
    ],
    ROOT: (locale: string) => ["cart", locale],
    SUGGESTED_PRODUCTS: (locale: string) => [
      "cart",
      locale,
      "suggested-products",
    ],
  },

  CATEGORY: {
    MOBILE_PRODUCTS_INFINITE: ({
      categoryPath,
      categoryUid,
      filters,
      filtersSignature,
      initialPage,
      locale,
      pageSize,
      searchTerm,
      sortBy,
      totalPages,
    }: {
      categoryPath: string;
      categoryUid: string;
      filters: Record<string, string[]>;
      filtersSignature: string;
      initialPage: number;
      locale: string;
      pageSize: number;
      searchTerm?: string;
      sortBy?: string;
      totalPages: number;
    }) => [
      "category",
      "mobile-products-infinite",
      locale,
      categoryUid,
      categoryPath,
      initialPage,
      pageSize,
      totalPages,
      searchTerm || "",
      sortBy || "",
      filters,
      filtersSignature,
    ],
  },

  CUSTOMER: (locale: string) => ["customer", locale],

  GEOLOCATION: ["geolocation"],

  LOCKER_LOCATIONS: ({
    language,
    latitude,
    longitude,
    type,
  }: {
    language: string;
    latitude?: number;
    longitude?: number;
    type?: LockerType;
  }) => ["locker-locations", latitude, longitude, language, type],

  STORE_CONFIG: (locale: string) => ["store-config", locale],

  WISHLIST: {
    FULL: (locale: string) => ["wishlist", locale, "full"],
    PAGINATED: (locale: string, page: number, pageSize: number) => [
      "wishlist",
      locale,
      "paginated",
      page,
      pageSize,
    ],
    ROOT: (locale: string) => ["wishlist", locale],
  },
};
