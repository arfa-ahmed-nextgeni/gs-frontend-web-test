"use client";

import { useTransition } from "react";

import Image, { StaticImageData } from "next/image";

import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import WishlistFilledIcon from "@/assets/icons/wishlist-filled-icon.svg";
import WishlistOutlineIcon from "@/assets/icons/wishlist-outline-icon.svg";
import { ProductCardWishlistButtonSkeleton } from "@/components/product/product-card/fallbacks/product-card-wishlist-button-skeleton";
import { setProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin";
import { useToastContext } from "@/components/providers/toast-provider";
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
import {
  trackAddToWishlist,
  trackCartToWishlist,
  trackRemoveFromWishlist,
} from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildProductPropertiesFromCard,
} from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { Cart } from "@/lib/models/cart";
import {
  getLoginUrlWithRedirect,
  saveScrollPosition,
  setSuppressRegistration,
} from "@/lib/utils/auth-redirect";
import { isOk } from "@/lib/utils/service-result";

import type { ProductCardActionsState } from "@/components/product/product-card/hooks/use-product-card-actions-state";
import type { ProductCardInteractionProps } from "@/components/product/product-card/types/product-card-click-origin-types";

type ProductCardWishlistButtonContentProps = {
  addIcon?: StaticImageData | string;
  className?: string;
  isInCart: ProductCardActionsState["isInCart"];
  isWishlisted: ProductCardActionsState["isWishlisted"];
  removeIcon?: StaticImageData | string;
  size?: number;
} & ProductCardInteractionProps;

type ProductCardWishlistButtonProps = {
  isConfigurable: ProductCardActionsState["isConfigurable"];
  isWishlistItem?: boolean;
} & ProductCardWishlistButtonContentProps;

export const ProductCardWishlistButton = ({
  addIcon = WishlistOutlineIcon,
  className = "",
  isConfigurable,
  isInCart,
  isWishlisted,
  isWishlistItem,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  removeIcon = WishlistFilledIcon,
  searchTerm,
  size = 20,
  ...restProps
}: ProductCardWishlistButtonProps) => {
  if (isConfigurable && !isWishlistItem) {
    return null;
  }

  return (
    <ProductCardWishlistButtonContent
      addIcon={addIcon}
      className={className}
      isInCart={isInCart}
      isWishlisted={isWishlisted}
      lpColumn={lpColumn}
      lpExtra={lpExtra}
      lpInnerPosition={lpInnerPosition}
      lpRow={lpRow}
      position={position}
      product={product}
      removeIcon={removeIcon}
      searchTerm={searchTerm}
      size={size}
      {...restProps}
    />
  );
};

const ProductCardWishlistButtonContent = ({
  addIcon = WishlistOutlineIcon,
  categoryId,
  className = "",
  isInCart,
  isWishlisted,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  product,
  removeIcon = WishlistFilledIcon,
  searchTerm,
  size = 20,
}: ProductCardWishlistButtonContentProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;

  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();
  const isMobile = useIsMobile();
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
    setProductCardClickOrigin({
      categoryId,
      lpColumn,
      lpExtra,
      lpInnerPosition,
      lpRow,
      position,
      searchTerm,
    });
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
      trackRemoveFromWishlist(product.sku || "");

      removeFromWishlist({
        itemId: itemInWishlist?.idInWishlist || "",
        wishlistId: wishlist?.id || "",
      });
    } else {
      setClickOrigin();

      const productProperties = buildProductPropertiesFromCard(product);
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

  const isLoading = isAdding > 0 || isRemoving > 0 || isAuthPending;

  if (isWishlistLoading) {
    return <ProductCardWishlistButtonSkeleton className={className} />;
  }

  return (
    <button
      className={className}
      data-loading={isLoading ? "true" : undefined}
      disabled={isLoading || isCartPending}
      onClick={handleWishlistClick}
    >
      {isLoading ? (
        <Spinner variant="dark" />
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
