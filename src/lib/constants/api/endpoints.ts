import { Locale } from "@/lib/constants/i18n";
import { QueryParamsKey } from "@/lib/constants/query-params";

export const AUTH_ENDPOINTS = {
  LOGOUT: "/integration/customer/token/invalidate",
  OTP_LOGIN: "/mobile-login/otp-post",
  OTP_VERIFY: "/mobile-login/validate-otp",
  SELECT_ACCOUNT: "/mobile-login/select-account",
} as const;

export const API_ENDPOINTS = {
  CONFIG: {
    AREAS: (countryCode: string, city: string) =>
      `/address/areas?country_id=${countryCode}&city=${city}`,
    CITIES: (countryCode: string) => `/address/areas?country_id=${countryCode}`,
    COUNTRIES: "/address/countries",
    STATES: (countryCode: string) =>
      `/address/states?country_id=${countryCode}`,
    STORES_CONFIG: "/store-config",
  },
  CUSTOMER: {
    DELETE_ACCOUNT: "/customer/account/delete",
    DELETE_PAYMENT_CARD: (cardId: string) =>
      `/customer/account/mycards/${cardId}`,
    PAYMENT_CARDS: "/customer/account/mycards",
    UPDATE_CARD_WITH_PAYMENT_ID: "/customer/account/updatepayment",
  },
};

export const APP_API_ENDPOINTS = {
  ADDRESS: {
    AREAS: (locale: Locale, city: string) =>
      `/address/areas?locale=${locale}&city=${city}`,
    CITIES: (locale: Locale) => `/address/cities?locale=${locale}`,
    COUNTRIES: (locale: Locale) => `/address/countries?locale=${locale}`,
    STATES: (locale: Locale, countryCode: string) =>
      `/address/states?locale=${locale}&country=${countryCode}`,
  },
  CART: {
    DETAILS: (locale: Locale, page: number, pageSize: number) =>
      `/cart-details?${QueryParamsKey.Locale}=${locale}&${QueryParamsKey.Page}=${page}&${QueryParamsKey.PageSize}=${pageSize}`,
    SUGGESTED_PRODUCTS: (locale: Locale) =>
      `/cart-suggested-products?${QueryParamsKey.Locale}=${locale}`,
  },
  CATEGORY: {
    PRODUCTS: ({
      categoryPath,
      categoryUid,
      filters,
      locale,
      page,
      pageSize,
      sortBy,
    }: {
      categoryPath: string;
      categoryUid: string;
      filters: Record<string, string[]>;
      locale: Locale;
      page: number;
      pageSize: number;
      sortBy?: string;
    }) => {
      const searchParams = new URLSearchParams();
      searchParams.set(QueryParamsKey.CategoryPath, categoryPath);
      searchParams.set(QueryParamsKey.CategoryUid, categoryUid);
      searchParams.set(QueryParamsKey.Locale, locale);
      searchParams.set(QueryParamsKey.Page, String(page));
      searchParams.set(QueryParamsKey.PageSize, String(pageSize));

      if (sortBy) {
        searchParams.set(QueryParamsKey.Sort, sortBy);
      }

      Object.entries(filters).forEach(([key, values]) => {
        values.forEach((value) => {
          searchParams.append(key, value);
        });
      });

      return `/category-products?${searchParams.toString()}`;
    },
  },
  CUSTOMER: {
    ME: "/customer/me",
    ORDER_BY_NUMBER: (locale: Locale, orderNumber: string) =>
      `/api/customer/orders/${orderNumber}?${QueryParamsKey.Locale}=${locale}`,
    WISHLIST: (locale: Locale, page: number, pageSize: number) =>
      `/customer/wishlist?${QueryParamsKey.Locale}=${locale}&${QueryParamsKey.Page}=${page}&${QueryParamsKey.PageSize}=${pageSize}`,
  },
  LOCKER_LOCATIONS: {
    FODEL: "/locker-locations/fodel",
    REDBOX: "/locker-locations/redbox",
  },
  SEARCH: {
    AUTOCOMPLETE: ({
      locale,
      page,
      pageSize,
      phrase,
      sortBy,
    }: {
      locale: Locale;
      page: number;
      pageSize: number;
      phrase: string;
      sortBy?: string;
    }) => {
      const searchParams = new URLSearchParams();
      searchParams.set(QueryParamsKey.Locale, locale);
      searchParams.set(QueryParamsKey.Page, String(page));
      searchParams.set(QueryParamsKey.PageSize, String(pageSize));
      searchParams.set(QueryParamsKey.Search, phrase);

      if (sortBy) {
        searchParams.set(QueryParamsKey.Sort, sortBy);
      }

      return `/search?${searchParams.toString()}`;
    },
    PRODUCTS: ({
      filters,
      locale,
      page,
      pageSize,
      phrase,
      sortBy,
    }: {
      filters?: Record<string, string[]>;
      locale: Locale;
      page: number;
      pageSize: number;
      phrase: string;
      sortBy?: string;
    }) => {
      const searchParams = new URLSearchParams();
      searchParams.set(QueryParamsKey.Locale, locale);
      searchParams.set(QueryParamsKey.Page, String(page));
      searchParams.set(QueryParamsKey.PageSize, String(pageSize));
      searchParams.set(QueryParamsKey.Search, phrase);

      if (sortBy) {
        searchParams.set(QueryParamsKey.Sort, sortBy);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
          values.forEach((value) => {
            searchParams.append(key, value);
          });
        });
      }

      return `/search/products?${searchParams.toString()}`;
    },
  },
  STORE_CONFIG: (locale: Locale) =>
    `/store-config?${QueryParamsKey.Locale}=${locale}`,
};

export const OPERATIONS_ENDPOINTS = {
  FODEL_POINTS: "/fodel/points",
  REDBOX_POINTS: "/red-box/points",
} as const;

export const ORDER_ENDPOINTS = {
  MAKE_PAYMENT: "/order/makePayment",
  TRACK_SHIPMENT: (
    orderId: string,
    trackingNumber: string,
    type?: "incrementId"
  ) =>
    `/track-shipment/order/${orderId}/tracking/${trackingNumber}${type === "incrementId" ? "?type=incrementId" : ""}`,
} as const;

export const PAYMENT_ENDPOINTS = {
  APPLE_PAY_VALIDATE_MERCHANT:
    "/api/rest/v1/payments/checkout/applepay/validate-merchant",
  CUSTOMER_CARD_PAYMENT: "/api/rest/v1/payments/checkout/customer-card-payment",
  GET_CUSTOMER_CARD: (sourceId: string) =>
    `/api/rest/v1/payments/checkout/customer-card/${sourceId}`,
  PAYFORT_APPLE_PAY_PAY: "/api/rest/v1/payments/payfort/ae/gs/apple-pay/pay",
  PAYFORT_APPLE_PAY_VALIDATE_MERCHANT:
    "/api/rest/v1/payments/payfort/applepay/validate-merchant",
  PROCESS_PAYMENT: "/api/rest/v1/payments/checkout/payments",
} as const;

export const CHECKOUT_API_ENDPOINTS = {
  TOKENS: "/tokens",
} as const;
