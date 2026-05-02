"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useIsMutating } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import MoveToWishlistIcon from "@/assets/icons/move-to-wishlist-icon.svg";
import WishlistFilledIcon from "@/assets/icons/wishlist-filled-icon.svg";
import { useProductCardActionsState } from "@/components/product/product-card/hooks/use-product-card-actions-state";
import { useToastContext } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useCart } from "@/contexts/use-cart";
import { useUI } from "@/contexts/use-ui";
import { useWishlist } from "@/contexts/use-wishlist";
import { usePendingWishlist } from "@/contexts/wishlist/pending-wishlist-context";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useAddProductToWishlist } from "@/hooks/mutations/wishlist/use-add-product-to-wishlist";
import { useRemoveProductFromWishlist } from "@/hooks/mutations/wishlist/use-remove-product-from-wishlist";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";
import {
  trackCartToWishlist,
  trackRemoveFromWishlist,
} from "@/lib/analytics/events";
import {
  buildCartProperties,
  buildProductPropertiesFromCartItem,
} from "@/lib/analytics/utils/build-properties";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import {
  getLoginUrlWithRedirect,
  saveScrollPosition,
  setSuppressRegistration,
} from "@/lib/utils/auth-redirect";
import { isOk } from "@/lib/utils/service-result";

import type { CartItem } from "@/lib/models/cart";

export const CartItemWishlistButton = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  const locale = useLocale() as Locale;

  const { isAuthorized } = useUI();
  const { showOtpLoginPopup } = useAuthUI();
  const isMobile = useIsMobile();
  const { cart } = useCart();
  const { isInCart, isWishlisted } = useProductCardActionsState(item);
  const { isLoading: isWishlistLoading, wishlist } = useWishlist();
  const { addPendingAction } = usePendingWishlist();
  const { showWarning } = useToastContext();

  const [isAuthPending, startAuthTransition] = useTransition();

  const t = useTranslations("ProductPage.messages");
  const selectedOptionId = item.options?.choices?.[0]?.value;
  const wishlistSku =
    selectedOptionId && item.skuParent ? item.skuParent : item.sku || "";

  const { mutate: removeFromWishlist } = useRemoveProductFromWishlist({
    selectedOptionId,
    sku: wishlistSku,
  });
  const { mutate: addToWishlist } = useAddProductToWishlist({
    selectedOptionId,
    sku: wishlistSku,
  });
  const { mutate: removeProductFromCart } = useRemoveProductFromCart({
    skipTracking: true,
    sku: item.sku || "",
  });

  const isAddingToWishlist = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.ADD({
      locale,
      selectedOptionId,
      sku: wishlistSku,
    }),
  });
  const isRemovingFromWishlist = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.REMOVE({
      locale,
      selectedOptionId,
      sku: wishlistSku,
    }),
  });
  const isRemovingFromCart = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.REMOVE({
      locale,
      sku: item.sku || "",
    }),
  });
  const isLoading =
    isAddingToWishlist > 0 ||
    isRemovingFromWishlist > 0 ||
    isRemovingFromCart > 0 ||
    isAuthPending;

  const handleClick = async () => {
    if (isLoading) {
      return;
    }

    if (!isAuthorized) {
      addPendingAction({
        ...(selectedOptionId && { selectedOptionId }),
        sku: wishlistSku,
      });
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
      (wishlistItem) => wishlistItem.sku === item.sku
    );

    if (isWishlisted) {
      trackRemoveFromWishlist(item.sku || "");

      removeFromWishlist({
        itemId: itemInWishlist?.idInWishlist || "",
        wishlistId: wishlist?.id || "",
      });
      return;
    }

    removeProductFromCart(
      {
        itemUid: item.uidInCart,
      },
      {
        onSuccess: (response) => {
          if (!isOk(response)) {
            return;
          }

          if (cart && isInCart) {
            trackCartToWishlist(
              buildCartProperties(cart),
              buildProductPropertiesFromCartItem(item)
            );
          }

          addToWishlist({
            selectedOptionId,
            sku: wishlistSku,
            wishlistId: wishlist?.id || "",
          });
        },
      }
    );
  };

  if (isWishlistLoading) {
    return (
      <div className="border-border-base h-[50px] w-[50px] rounded-xl border" />
    );
  }

  return (
    <button
      className="border-border-base flex h-[50px] w-[50px] items-center justify-center rounded-xl border shadow-none"
      data-loading={isLoading ? "true" : undefined}
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <Spinner variant="dark" />
      ) : (
        <Image
          alt={isWishlisted ? "Remove from wishlist" : "Move to wishlist"}
          className="size-6"
          height={24}
          src={isWishlisted ? WishlistFilledIcon : MoveToWishlistIcon}
          width={24}
        />
      )}
    </button>
  );
};
