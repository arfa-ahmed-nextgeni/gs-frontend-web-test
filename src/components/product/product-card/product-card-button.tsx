"use client";

import { useTransition } from "react";

import { useIsMutating } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import { useProductCard } from "@/components/product/product-card/product-card-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useNotifyMe } from "@/contexts/notify-me-context";
import { useCart } from "@/contexts/use-cart";
import { useWishlist } from "@/contexts/use-wishlist";
import { useAddProductToCart } from "@/hooks/mutations/cart/use-add-product-to-cart";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useAddWishlistItemToCart } from "@/hooks/mutations/wishlist/use-add-wishlist-item-to-cart";
import { useRouter } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { buildProductPropertiesFromCard } from "@/lib/analytics/utils/build-properties";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { CartAction } from "@/lib/constants/product/product-card";
import { ROUTES } from "@/lib/constants/routes";
import { ProductCardModel } from "@/lib/models/product-card-model";
import { cn } from "@/lib/utils";

import type { Locale } from "@/lib/constants/i18n";

export const ProductCardButton = () => {
  const router = useRouter();
  const t = useTranslations("productCard.cartAction");
  const locale = useLocale() as Locale;

  const {
    cartAction,
    categoryId,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    originalProduct,
    position,
    product,
    searchTerm,
  } = useProductCard();
  const { wishlist } = useWishlist();
  const { cart, isLoading: isCartLoading } = useCart();
  const { setNotifyMeData } = useNotifyMe();

  const { mutate: addProductToCart } = useAddProductToCart({
    product: buildProductPropertiesFromCard(
      originalProduct as ProductCardModel
    ),
    sku: product.sku || "",
  });
  const { mutate: addWishlistItemToCart } = useAddWishlistItemToCart({
    sku: product.sku || "",
  });
  const { mutate: removeProductFromCart } = useRemoveProductFromCart({
    sku: product.sku || "",
  });

  const [isNavigating, startNavigating] = useTransition();
  const isAdding = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.ADD({
      locale,
      sku: product.sku || "",
    }),
  });
  const isMovingFromWishlistToCart = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.MOVE_TO_CART({
      locale,
      sku: product.sku || "",
    }),
  });
  const isAddingToWishlist = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.ADD({
      locale,
      sku: product.sku || "",
    }),
  });
  const isRemovingFromWishlist = useIsMutating({
    mutationKey: MUTATION_KEYS.WISHLIST.REMOVE({
      locale,
      sku: product.sku || "",
    }),
  });
  const isRemoving = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.REMOVE({
      locale,
      sku: product.sku || "",
    }),
  });
  const isWishlistPending =
    isAddingToWishlist > 0 || isRemovingFromWishlist > 0;

  // Helper function to set click origin based on available context
  // Priority: LP > PLP > Search
  const setClickOrigin = () => {
    if (lpRow !== undefined && lpColumn !== undefined) {
      // Track LP click origin
      clickOriginTrackingManager.setClickOrigin({
        column: lpColumn,
        extra: lpExtra,
        inner_position: lpInnerPosition,
        origin: "lp",
        row: lpRow,
      });
    } else if (categoryId !== undefined && position !== undefined) {
      // Track PLP click origin
      clickOriginTrackingManager.setClickOrigin({
        categoryId,
        origin: "plp",
        position,
      });
    } else if (searchTerm && position !== undefined) {
      // Track search click origin
      clickOriginTrackingManager.setClickOrigin({
        origin: "search",
        position,
        term: searchTerm,
      });
    }
  };

  const handleClick = () => {
    if (isWishlistPending) {
      return;
    }

    switch (cartAction) {
      case CartAction.Add:
        if (!cart?.id || !product.sku) return;

        // Set click origin before adding to cart
        setClickOrigin();

        addProductToCart({
          sku: product.sku || "",
        });

        break;
      case CartAction.MoveToBag:
        const itemInWishlist = wishlist?.items.find(
          (item) => item.sku === product.sku
        );

        // Set click origin before moving from wishlist to cart
        setClickOrigin();

        addWishlistItemToCart({
          itemId: itemInWishlist?.idInWishlist || "",
          wishlistId: wishlist?.id || "",
        });
        break;
      case CartAction.NotifyMe:
        if (!product.externalId || !product.name) return;
        startNavigating(() => {
          setNotifyMeData({
            product: null,
            productCard: originalProduct as ProductCardModel,
            selectedProduct: null,
          });
          router.push(ROUTES.NOTIFY_ME(product.externalId, product.name), {
            scroll: false,
          });
        });
        break;
      case CartAction.Remove:
        const itemInCart = cart?.items.find((item) => item.sku === product.sku);

        if (!cart?.id || !itemInCart) return;

        // Set click origin before removing from cart
        setClickOrigin();

        removeProductFromCart({ itemUid: itemInCart.uidInCart });
        break;

      default:
        if (product.urlKey) {
          startNavigating(() => {
            // Set click origin before navigating to product page
            setClickOrigin();
            router.push(ROUTES.PRODUCT.BY_URL_KEY(product.urlKey));
          });
        }
        break;
    }
  };

  const isLoading =
    isRemoving > 0 ||
    isAdding > 0 ||
    isMovingFromWishlistToCart > 0 ||
    isNavigating;
  const isCartAction = [
    CartAction.Add,
    CartAction.MoveToBag,
    CartAction.Remove,
  ].includes(cartAction);

  if (isCartLoading && isCartAction) {
    return <Skeleton className="h-8.75 w-25 rounded-xl" />;
  }

  return (
    <button
      className={cn(
        "w-25 h-8.75 transition-default text-text-primary border-border-base bg-btn-bg-default rounded-xl border text-center text-xs font-bold focus:outline-none",
        {
          "bg-btn-bg-alert text-text-inverse border-none":
            cartAction === CartAction.Remove,
          "bg-btn-bg-primary text-text-ghost border-none":
            cartAction === CartAction.MoveToBag,
          "bg-btn-bg-success border-none": cartAction === CartAction.Added,
          "disabled:bg-btn-bg-muted disabled:text-text-inverse disabled:border-none":
            !isLoading,
          "hover:bg-btn-bg-surface focus:bg-btn-bg-surface":
            cartAction === CartAction.Add,
        }
      )}
      data-loading={isLoading ? "true" : undefined}
      disabled={isLoading || isWishlistPending}
      onClick={handleClick}
    >
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner
            variant={
              [CartAction.MoveToBag, CartAction.Remove].includes(cartAction)
                ? "light"
                : "dark"
            }
          />
        </div>
      ) : (
        t(cartAction as any)
      )}
    </button>
  );
};
