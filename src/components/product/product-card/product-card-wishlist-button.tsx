"use client";

import { ReactNode, useTransition } from "react";

import Image, { StaticImageData } from "next/image";

import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import WishlistFilledIcon from "@/assets/icons/wishlist-filled-icon.svg";
import WishlistOutlineIcon from "@/assets/icons/wishlist-outline-icon.svg";
import { useProductCard } from "@/components/product/product-card/product-card-context";
import { useToastContext } from "@/components/providers/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useCart } from "@/contexts/use-cart";
import { useUI } from "@/contexts/use-ui";
import { useWishlist } from "@/contexts/use-wishlist";
import { usePendingWishlist } from "@/contexts/wishlist/pending-wishlist-context";
import { useAddProductToWishlist } from "@/hooks/mutations/wishlist/use-add-product-to-wishlist";
import { useRemoveProductFromWishlist } from "@/hooks/mutations/wishlist/use-remove-product-from-wishlist";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useRouter } from "@/i18n/navigation";
import { removeProductFromCartAction } from "@/lib/actions/cart/remove-product-from-cart";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import {
  trackAddToWishlist,
  trackCartToWishlist,
} from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildProductPropertiesFromCard,
} from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";
import {
  getLoginUrlWithRedirect,
  saveScrollPosition,
  setSuppressRegistration,
} from "@/lib/utils/auth-redirect";
import { isOk } from "@/lib/utils/service-result";

type ProductCardWishlistButtonProps = {
  addIcon?: StaticImageData | string;
  className?: string;
  loadingComponent?: ReactNode;
  removeIcon?: StaticImageData | string;
  size?: number;
};

export const ProductCardWishlistButton = ({
  addIcon = WishlistOutlineIcon,
  className = "",
  loadingComponent,
  removeIcon = WishlistFilledIcon,
  size = 20,
}: ProductCardWishlistButtonProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();
  const isMobile = useIsMobile();
  const {
    categoryId,
    isConfigurable,
    isInCart,
    isWishlisted,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    originalProduct,
    position,
    product,
    searchTerm,
  } = useProductCard();
  const { cart } = useCart();
  const { isLoading: isWishlistLoading, wishlist } = useWishlist();
  const { isCart } = useRouteMatch();
  const { addPendingAction } = usePendingWishlist();
  const { showWarning } = useToastContext();

  const [isAuthPending, startAuthTransition] = useTransition();

  const t = useTranslations("ProductPage.messages");

  const { mutate: removeFromWishlist } = useRemoveProductFromWishlist({
    sku: product.sku || "",
  });
  const { mutate: addToWishlist } = useAddProductToWishlist({
    sku: product.sku || "",
  });
  const isRemoving = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.REMOVE({
      locale,
      sku: product.sku || "",
    }),
  });
  const isAdding = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.ADD({
      locale,
      sku: product.sku || "",
    }),
  });
  const isAddingToCart = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.ADD({
      locale,
      sku: product.sku || "",
    }),
  });
  const isRemovingFromCart = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.REMOVE({
      locale,
      sku: product.sku || "",
    }),
  });
  const isMovingToCart = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.MOVE_TO_CART({
      locale,
      sku: product.sku || "",
    }),
  });
  const isCartPending =
    isAddingToCart > 0 || isRemovingFromCart > 0 || isMovingToCart > 0;

  const setClickOrigin = () => {
    if (lpRow !== undefined && lpColumn !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        column: lpColumn,
        extra: lpExtra,
        inner_position: lpInnerPosition,
        origin: "lp",
        row: lpRow,
      });
    } else if (categoryId !== undefined && position !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        categoryId,
        origin: "plp",
        position,
      });
    } else if (searchTerm && position !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        origin: "search",
        position,
        term: searchTerm,
      });
    }
  };

  const handleWishlistClick = async () => {
    if (isCartPending) {
      return;
    }

    if (!isAuthorized) {
      const payload = {
        sku: product.sku || "",
      };
      addPendingAction(payload);
      setSuppressRegistration();

      showWarning(t("loginToAddToWishlist"), " ");

      if (isMobile) {
        saveScrollPosition();
        startAuthTransition(() => {
          router.push(getLoginUrlWithRedirect());
        });
      } else {
        showOtpLoginPopup();
      }

      return;
    }

    const itemInWishlist = wishlist?.items.find(
      (item) => item.sku === product.sku
    );

    if (isInCart && !isWishlisted && isCart) {
      const itemInCart = cart?.items.find((item) => item.sku === product.sku);

      const response = await removeProductFromCartAction({
        itemUid: itemInCart?.uidInCart || "",
      });

      if (isOk(response)) {
        queryClient.setQueryData<Cart>(
          QUERY_KEYS.CART.FULL(locale),
          response.data
        );
      }
    }

    if (isWishlisted) {
      removeFromWishlist({
        itemId: itemInWishlist?.idInWishlist || "",
        wishlistId: wishlist?.id || "",
      });
    } else {
      setClickOrigin();

      const productProperties = buildProductPropertiesFromCard(
        originalProduct as ProductCardModel
      );
      if (categoryId !== undefined) {
        productProperties["category.id"] = String(categoryId);
      }

      if (isCart && cart && isInCart) {
        const cartProperties = buildCartProperties(cart);
        trackCartToWishlist(cartProperties, productProperties);
      } else {
        trackAddToWishlist(productProperties);
      }

      addToWishlist({
        sku: product.sku || "",
        wishlistId: wishlist?.id || "",
      });
    }
  };

  if (isConfigurable) {
    return null;
  }

  const isLoading = isAdding > 0 || isRemoving > 0 || isAuthPending;
  const skeletonComponent = loadingComponent || (
    <Skeleton className={cn("size-10 rounded-xl", className)} />
  );

  if (isWishlistLoading) {
    return skeletonComponent;
  }

  return (
    <button
      className={className}
      data-loading={isLoading ? "true" : undefined}
      disabled={isLoading || isCartPending}
      onClick={handleWishlistClick}
    >
      {isLoading ? (
        loadingComponent || <Spinner variant="dark" />
      ) : (
        <Image
          alt={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="size-5"
          height={size}
          src={isWishlisted ? removeIcon : addIcon}
          width={size}
        />
      )}
    </button>
  );
};
