import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { PaymentStatusType } from "@/lib/constants/payment-status";
import { QueryParamsKey } from "@/lib/constants/query-params";

export const ROUTES = {
  ACCOUNT_BILLING: "/account-billing",
  BLOG: `/blog`,
  CART: {
    DRAWER: "/cart-drawer",
    ROOT: "/cart",
  },
  CATEGORIES: "/categories",
  CATEGORY: {
    BY_SLUG: (slug: string) => `/c/${slug}`,
    ROOT: "/c",
  },
  CHECKOUT: {
    ADD_DELIVERY_ADDRESS: "/checkout/add-delivery-address",
    ADD_GIFT_WRAPPING: "/checkout/add-gift-wrapping",
    ADD_PICKUP_POINT: (type: LockerType) =>
      `/checkout/add-pickup-point?type=${type}`,
    ORDER_CONFIRMATION: (orderId: string) =>
      `/checkout/order-confirmation?${QueryParamsKey.OrderId}=${orderId}`,
    PAYFORT_CALLBACK_API: "/api/checkout/payfort/callback",
    PAYMENT_SUCCESS_API: "/api/checkout/payment-success",
    REFILL_CART_API: (paymentStatus: PaymentStatusType) =>
      `/api/checkout/refill-cart?${QueryParamsKey.PaymentStatus}=${paymentStatus}`,
    ROOT: "/checkout",
  },
  CONTACT: "/contact-us",
  CUSTOMER: {
    ACCOUNT: "/customer/account",
    CARDS: "/customer/cards",
    DELETE_ACCOUNT: "/customer/delete-account",
    LANGUAGE: "/customer/language",
    LOGIN: "/customer/login",
    ORDERS: "/customer/orders",
    PROFILE: {
      ADDRESSES: {
        ADD: "/customer/profile/addresses/add",
        EDIT: (id: string) => `/customer/profile/addresses/edit/${id}`,
        ROOT: "/customer/profile/addresses",
      },
      ROOT: "/customer/profile",
      WISHLIST: "/customer/profile/wishlist",
    },
    REGION: "/customer/region",
    RETURNS: "/customer/returns",
    ROOT: "/customer",
    TICKETS: "/customer/tickets",
    WALLET: "/customer/wallet",
  },
  CUSTOMER_SERVICE: "/customer-service",
  FAQ: "/faq",
  FORGET_PASSWORD: "/forget-password",
  HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",
  NOTIFY_ME: (externalId: string, name: string) =>
    `/notify-me/${externalId}?${QueryParamsKey.Name}=${encodeURIComponent(name)}`,
  ORDERS: "/account-order",
  PRIVACY: "/privacy-policy",
  PRODUCT: {
    ADD: (urlKey: string) => `/p/${urlKey}/reviews/add`,
    BY_URL_KEY: (urlKey: string) => `/p/${urlKey}`,
    REVIEWS: (urlKey: string, productId: number) =>
      `/p/${urlKey}/reviews/${productId}`,
    ROOT: "/p",
  },
  PRODUCTS: "/products",
  PROFILE: "/profile",
  REGISTER: "/register",
  ROOT: "/",
  SAVELISTS: "/account-savelists",
  SEARCH: `/search`,
  TERMS: "/terms-conditions",
} as const;

export const ROUTE_PLACEHOLDER = "__placeholder__" as const;
