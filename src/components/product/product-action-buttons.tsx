"use client";

import { useTransition } from "react";

import { useIsMutating } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { ProductWishlistButton } from "@/components/product/product-wishlist-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useNotifyMe } from "@/contexts/notify-me-context";
import { useProductDetails } from "@/contexts/product-details-context";
import { useCart } from "@/contexts/use-cart";
import { useAddProductToCart } from "@/hooks/mutations/cart/use-add-product-to-cart";
import { useRouter } from "@/i18n/navigation";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { ProductType } from "@/lib/constants/product/product-details";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

import type { Locale } from "@/lib/constants/i18n";

export function ProductActionButtons({
  layout = "default",
}: {
  layout?: "default" | "sticky";
}) {
  const router = useRouter();
  const { appLinks, product, selectedVariantIndex } = useProductDetails();
  const { setNotifyMeData } = useNotifyMe();
  const { isLoading: isCartLoading } = useCart();
  const locale = useLocale() as Locale;

  const selectedProduct = product.variants[selectedVariantIndex] || product;
  const selectedOptionId =
    product.isConfigurable && selectedProduct.id.trim() !== ""
      ? selectedProduct.id
      : undefined;

  const { mutate: addProductToCart } = useAddProductToCart({
    product: buildProductPropertiesFromDetails(selectedProduct, product),
    selectedOptionId,
    sku: product.sku || "",
  });

  const t = useTranslations("ProductPage.actions");

  const [isNavigatingToNotifyMe, startNavigatingToNotifyMe] = useTransition();
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
  const isAddingToCartPending = useIsMutating({
    mutationKey: MUTATION_KEYS.CART.ADD({
      locale,
      selectedOptionId,
      sku: product.sku || "",
    }),
  });
  const isWishlistPending =
    isAddingToWishlistPending > 0 || isRemovingFromWishlistPending > 0;

  const handleNavigateToNotifyMe = () => {
    setNotifyMeData({
      product,
      productCard: null,
      selectedProduct,
    });
    startNavigatingToNotifyMe(() => {
      router.push(ROUTES.NOTIFY_ME(selectedProduct.externalId, product.name), {
        scroll: false,
      });
    });
  };

  const isEGiftCard = product.type === ProductType.EGiftCard;

  const inStock = selectedProduct?.inStock;

  const isLoading = isAddingToCartPending > 0;

  const handleAddToBag = () => {
    if (isLoading || isWishlistPending) {
      return;
    }

    if (inStock && !isEGiftCard) {
      const payload: {
        selectedOptionId?: string;
        sku: string;
      } = {
        sku: product.sku,
      };

      if (
        product.isConfigurable &&
        selectedProduct.id &&
        selectedProduct.id.trim() !== ""
      ) {
        payload.selectedOptionId = selectedProduct.id;
      }

      addProductToCart(payload);
    }
  };

  const handleInstallApp = () => {
    if (appLinks && appLinks.length > 0) {
      const userAgent = navigator.userAgent;

      let appLink = appLinks.find((link) => link.url.includes("apple"))?.url;

      if (/android/i.test(userAgent)) {
        const androidAppLink = appLinks.find((link) =>
          link.url.includes("google")
        );
        if (androidAppLink) {
          appLink = androidAppLink.url;
        }
      }

      window.open(appLink, "_blank");
    }
  };

  const shouldShowCartActionSkeleton =
    !!isCartLoading && inStock && !isEGiftCard;
  const isDisabled = isLoading || isWishlistPending;

  return (
    <div
      className={cn(
        "flex flex-row gap-5",
        layout === "default" ? "hidden lg:flex" : "lg:flex-0 flex flex-1"
      )}
    >
      {!inStock ? (
        <button
          className={cn(
            "transition-default h-12.5 bg-btn-bg-primary text-text-ghost flex flex-1 cursor-pointer items-center justify-center rounded-xl text-xl font-medium",
            "hover:bg-btn-bg-slate focus:bg-btn-bg-primary",
            {
              "lg:w-106": layout === "sticky",
            }
          )}
          disabled={isNavigatingToNotifyMe}
          onClick={handleNavigateToNotifyMe}
        >
          {isNavigatingToNotifyMe ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            t("notifyMe")
          )}
        </button>
      ) : shouldShowCartActionSkeleton ? (
        <Skeleton
          className={cn("h-12.5 flex-1 rounded-xl", {
            "lg:w-106": layout === "sticky",
          })}
        />
      ) : (
        <button
          className={cn(
            "transition-default h-12.5 bg-btn-bg-teal text-text-ghost flex-1 rounded-xl text-xl font-medium",
            "hover:bg-btn-bg-mint",
            !isLoading && "disabled:bg-btn-bg-muted",
            { "bg-btn-bg-mint": isLoading },
            "focus:bg-btn-bg-teal focus:outline-none",
            {
              "bg-btn-bg-primary hover:bg-btn-bg-slate focus:bg-btn-bg-primary":
                isEGiftCard || !inStock,
              "lg:w-106": layout === "sticky",
            }
          )}
          disabled={isDisabled}
          onClick={isEGiftCard ? handleInstallApp : handleAddToBag}
        >
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            t(!inStock ? "notifyMe" : isEGiftCard ? "installApp" : "addToBag")
          )}
        </button>
      )}

      <ProductWishlistButton />
    </div>
  );
}
