"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useIsMutating } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import WishlistFilledIcon from "@/assets/icons/wishlist-filled-icon.svg";
import WishlistOutlineIcon from "@/assets/icons/wishlist-outline-icon.svg";
import { useToastContext } from "@/components/providers/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useProductDetails } from "@/contexts/product-details-context";
import { useUI } from "@/contexts/use-ui";
import { useWishlist } from "@/contexts/use-wishlist";
import { usePendingWishlist } from "@/contexts/wishlist/pending-wishlist-context";
import { useAddProductToWishlist } from "@/hooks/mutations/wishlist/use-add-product-to-wishlist";
import { useRemoveProductFromWishlist } from "@/hooks/mutations/wishlist/use-remove-product-from-wishlist";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";
import {
  trackAddToWishlist,
  trackRemoveFromWishlist,
} from "@/lib/analytics/events";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import {
  getLoginUrlWithRedirect,
  saveScrollPosition,
  setSuppressRegistration,
} from "@/lib/utils/auth-redirect";
import { findMatchingWishlistItem } from "@/lib/utils/wishlist";

import type { Locale } from "@/lib/constants/i18n";

export const ProductWishlistButton = () => {
  const router = useRouter();

  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();
  const isMobile = useIsMobile();
  const locale = useLocale() as Locale;
  const { isWishlisted, product, selectedProduct } = useProductDetails();
  const selectedOptionId =
    product.isConfigurable && selectedProduct.id != null
      ? String(selectedProduct.id)
      : undefined;

  const { isLoading: isWishlistLoading, wishlist } = useWishlist();
  const { addPendingAction } = usePendingWishlist();
  const { showWarning } = useToastContext();

  const [isAuthPending, startAuthTransition] = useTransition();
  const isAddToCartPending = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.ADD({
      locale,
      selectedOptionId,
      sku: product.sku || "",
    }),
  });
  const isAddingToWishlistPending = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.ADD({
      locale,
      selectedOptionId,
      sku: product.sku || "",
    }),
  });
  const isRemovingFromWishlistPending = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.REMOVE({
      locale,
      selectedOptionId,
      sku: product.sku || "",
    }),
  });

  const t = useTranslations("ProductPage.messages");

  const { mutate: removeFromWishlist } = useRemoveProductFromWishlist({
    selectedOptionId,
    sku: product.sku || "",
  });
  const { mutate: addToWishlist } = useAddProductToWishlist({
    selectedOptionId,
    sku: product.sku || "",
  });

  const handleWishlistClick = () => {
    if (isAddToCartPending > 0 || isLoading) {
      return;
    }

    if (!isAuthorized) {
      const payload = {
        sku: product.sku || "",
        ...(selectedOptionId && {
          selectedOptionId,
        }),
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

    const itemInWishlist = findMatchingWishlistItem({
      product,
      selectedProduct,
      wishlist,
    });

    if (isWishlisted) {
      const skuToTrack = itemInWishlist?.childSku || product.sku || "";
      trackRemoveFromWishlist(skuToTrack);

      removeFromWishlist({
        itemId: itemInWishlist?.idInWishlist || "",
        wishlistId: wishlist?.id || "",
      });
    } else {
      // Track add_to_wishlist event
      const productProperties = buildProductPropertiesFromDetails(
        selectedProduct,
        product
      );
      trackAddToWishlist(productProperties);

      const payload: {
        selectedOptionId?: string;
        sku: string;
        wishlistId: string;
      } = {
        sku: product.sku || "",
        wishlistId: wishlist?.id || "",
      };

      if (selectedOptionId) {
        payload["selectedOptionId"] = selectedOptionId;
      }

      addToWishlist(payload);
    }
  };

  const isLoading =
    isAddingToWishlistPending > 0 ||
    isRemovingFromWishlistPending > 0 ||
    isAuthPending;
  const isDisabled = isAddToCartPending > 0 || isLoading;

  if (isWishlistLoading) {
    return <Skeleton className="size-12.5 rounded-xl" />;
  }

  return (
    <button
      className="size-12.5 bg-btn-bg-inverse border-border-base flex items-center justify-center rounded-xl border"
      disabled={isDisabled}
      onClick={handleWishlistClick}
    >
      {isLoading ? (
        <Spinner variant="dark" />
      ) : (
        <Image
          alt={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="size-5"
          height={20}
          src={isWishlisted ? WishlistFilledIcon : WishlistOutlineIcon}
          width={20}
        />
      )}
    </button>
  );
};
