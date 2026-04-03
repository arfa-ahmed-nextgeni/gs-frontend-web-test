import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { ROUTES } from "@/lib/constants/routes";

export function getLastSegment(pathname: string) {
  const segments = getPathSegments(pathname);
  return segments[segments.length - 1];
}

export function getPathSegments(pathname: string) {
  return pathname.replace(/^\/|\/$/g, "").split("/");
}

export function getRouteKey(pathname: string) {
  const segments = getPathSegments(pathname);
  return segments.join(".");
}

export function normalizePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return (
    "/" +
    segments
      .map((segment) => (/^\d+$/.test(segment) ? ":id" : segment))
      .join("/")
  );
}

export const isPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isHomePath = (pathname: string) => pathname === ROUTES.HOME;

export const isCategoryPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CATEGORY.ROOT);

export const isCustomerPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.ROOT);

export const isAccountPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.ACCOUNT);

export const isLanguagePath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.LANGUAGE);

export const isRegionPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.REGION);

export const isProfilePath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.PROFILE.ROOT);

export const isProfileRootPath = (pathname: string) =>
  pathname === ROUTES.CUSTOMER.PROFILE.ROOT;

export const isWalletPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.WALLET);

export const isLoginPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.LOGIN);

export const isDeleteAccountPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.DELETE_ACCOUNT);

export const isAddAddressPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.PROFILE.ADDRESSES.ADD);

export const isWishlistPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CUSTOMER.PROFILE.WISHLIST);

export const isOrderConfirmationPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CHECKOUT.ORDER_CONFIRMATION("").split("?")[0]);

export const isOrderDetailsPath = (pathname: string) =>
  isPathPrefix(pathname, `${ROUTES.CUSTOMER.ORDERS}/view`);

export const isCartPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CART.ROOT);

export const isCartDrawerPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CART.DRAWER);

export const isCheckoutPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CHECKOUT.ROOT);

export const isCheckoutAddGiftWrappingPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CHECKOUT.ADD_GIFT_WRAPPING.split("?")[0]);

export const isAddDeliveryAddressPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.CHECKOUT.ADD_DELIVERY_ADDRESS.split("?")[0]);

export const isAddPickupPointPath = (pathname: string) =>
  isPathPrefix(
    pathname,
    ROUTES.CHECKOUT.ADD_PICKUP_POINT(LockerType.Fodel).split("?")[0]
  ) ||
  isPathPrefix(
    pathname,
    ROUTES.CHECKOUT.ADD_PICKUP_POINT(LockerType.Redbox).split("?")[0]
  );

export const isProductPath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.PRODUCT.ROOT);

export const isProductReviewsPath = (pathname: string): boolean => {
  const parts = pathname.split("/").filter(Boolean);

  return (
    parts.length === 4 &&
    parts[0] === "p" &&
    parts[2] === "reviews" &&
    !!parts[1] &&
    !!parts[3] &&
    parts[3] !== "add"
  );
};

export const isAddProductReviewPath = (pathname: string): boolean => {
  const parts = pathname.split("/").filter(Boolean);

  return (
    parts.length === 4 &&
    parts[0] === "p" &&
    parts[2] === "reviews" &&
    !!parts[1] &&
    !!parts[3] &&
    parts[3] === "add"
  );
};

export const isNotifyMePath = (pathname: string) =>
  isPathPrefix(pathname, ROUTES.NOTIFY_ME("", "").split("/?")[0]);

export const isCustomerServicePath = (pathname: string) =>
  pathname === ROUTES.CUSTOMER_SERVICE;
