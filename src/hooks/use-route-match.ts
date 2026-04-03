import { useMemo } from "react";

import { useNavigationContext } from "@/contexts/navigation-context";
import { usePathname } from "@/i18n/navigation";
import { getEffectivePathname } from "@/lib/utils/overlay-routes";
import {
  isAccountPath,
  isAddAddressPath,
  isAddDeliveryAddressPath,
  isAddPickupPointPath,
  isAddProductReviewPath,
  isCartPath,
  isCategoryPath,
  isCheckoutAddGiftWrappingPath,
  isCheckoutPath,
  isCustomerPath,
  isDeleteAccountPath,
  isHomePath,
  isLanguagePath,
  isLoginPath,
  isOrderConfirmationPath,
  isOrderDetailsPath,
  isProductPath,
  isProductReviewsPath,
  isProfilePath,
  isProfileRootPath,
  isRegionPath,
  isWalletPath,
  isWishlistPath,
} from "@/lib/utils/routes";

/**
 * Returns route match flags for layout (header, footer, nav).
 * When the current route is a parallel-route overlay (drawer/dialog), layout
 * uses the previous pathname so the underlying route's layout is preserved.
 *
 * Overlay routes are configured in @/lib/utils/overlay-routes. To add
 * a new parallel-route overlay, add its path matcher to that array.
 */
export const useRouteMatch = () => {
  const pathname = usePathname();
  const { previousPathname } = useNavigationContext();

  return useMemo(() => {
    const effectivePathname = getEffectivePathname(pathname, previousPathname);

    const isAddProductReview = isAddProductReviewPath(pathname);
    const isOrderDetails = isOrderDetailsPath(pathname);
    const isProductReviews = isProductReviewsPath(pathname);

    return {
      effectivePathname,
      isAccount: isAccountPath(effectivePathname),
      isAddAddress: isAddAddressPath(effectivePathname),
      isAddDeliveryAddress: isAddDeliveryAddressPath(pathname),
      isAddPickupPoint: isAddPickupPointPath(pathname),
      isAddProductReview,
      isCart: isCartPath(pathname),
      isCategory: isCategoryPath(effectivePathname),
      isCheckout: isCheckoutPath(pathname),
      isCheckoutAddGiftWrapping: isCheckoutAddGiftWrappingPath(pathname),
      isCustomer: isCustomerPath(effectivePathname),
      isDeleteAccount: isDeleteAccountPath(effectivePathname),
      isHome: isHomePath(effectivePathname),
      isLanguage: isLanguagePath(effectivePathname),
      isLogin: isLoginPath(pathname),
      isOrderConfirmation: isOrderConfirmationPath(pathname),
      isOrderDetails,
      isProduct: isProductPath(effectivePathname),
      isProductReviews,
      isProductRoot:
        isProductPath(effectivePathname) &&
        !isAddProductReview &&
        !isProductReviews,
      isProfile: isProfilePath(effectivePathname),
      isProfileRoot: isProfileRootPath(effectivePathname),
      isRegion: isRegionPath(effectivePathname),
      isWallet: isWalletPath(effectivePathname),
      isWishlist: isWishlistPath(effectivePathname),
      pathname,
    };
  }, [pathname, previousPathname]);
};
