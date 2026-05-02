"use client";

import { useTransition } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import EditIcon from "@/assets/icons/edit-icon.svg";
import GiftIcon from "@/assets/icons/gift-icon.svg";
import PlusIcon from "@/assets/icons/plus-icon.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { LocalizedPrice } from "@/components/shared/localized-price";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/contexts/use-cart";
import { useRemoveProductFromCart } from "@/hooks/mutations/cart/use-remove-product-from-cart";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { formatPrice } from "@/lib/utils/price";

interface CheckoutGiftWrappingProps {
  isEnabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function CheckoutGiftWrapping({
  isEnabled,
  onToggle,
}: CheckoutGiftWrappingProps) {
  const t = useTranslations("CheckoutPage");
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const { cart } = useCart();

  // Find wrap item in cart
  const wrapItem = cart?.items.find((item) => item.isWrap);
  const isGwpWrapItem = wrapItem?.isGwp;

  const removeMutation = useRemoveProductFromCart({
    sku: wrapItem?.sku || "",
  });

  const handleEdit = () => {
    if (wrapItem?.sku) {
      const params = new URLSearchParams({
        sku: wrapItem.sku,
      });
      if (cart?.giftMessage) {
        params.set("message", cart.giftMessage);
      }
      startNavigation(() => {
        router.push(
          `${ROUTES.CHECKOUT.ADD_GIFT_WRAPPING}?${params.toString()}`
        );
        onToggle?.(true);
      });
    }
  };

  const handleDelete = () => {
    if (wrapItem?.uidInCart) {
      removeMutation.mutate(
        { itemUid: wrapItem.uidInCart },
        {
          onSuccess: () => {
            onToggle?.(false);
          },
        }
      );
    }
  };

  // If wrap item exists, show the item card (pic1)
  if (wrapItem) {
    const priceLabel =
      wrapItem.currentPrice ||
      formatPrice({
        amount: wrapItem.priceValue,
        currencyCode: wrapItem.currency,
        locale: "en-US",
      });

    return (
      <div className="mt-2 rounded-[10px] bg-white">
        {/* Header */}
        <div className="flex h-[45px] items-center justify-between px-5 py-[15px]">
          <div className="flex items-center gap-5">
            <Image alt="gift" className="h-5 w-5" src={GiftIcon} />
            <span className="text-text-primary text-[15px] font-normal">
              {t("delivery.giftWrapping")}
            </span>
          </div>
          {!isGwpWrapItem && (
            <button
              aria-label="edit gift wrap"
              className="flex items-center justify-center"
              disabled={isNavigating}
              onClick={handleEdit}
              type="button"
            >
              {isNavigating ? (
                <Spinner className="size-4" variant="dark" />
              ) : (
                <Image
                  alt="edit"
                  className="h-4.5 w-4.5"
                  src={EditIcon}
                  style={{ filter: "brightness(0)" }}
                />
              )}
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="border-border-base border-t" />

        {/* Wrap Item Card */}
        <div className="flex h-[80px] items-center gap-5 px-4 py-5 lg:px-10">
          {wrapItem.imageUrl && (
            <div className="border-border-base relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-[10px] border">
              <ProductImageWithFallback
                alt={wrapItem.name}
                className="object-cover"
                fill
                src={wrapItem.imageUrl}
              />
            </div>
          )}
          <div className="flex flex-1 items-center justify-between gap-5">
            <p className="text-text-primary text-xs font-semibold">
              {wrapItem.name}
            </p>
            <div className="flex items-center gap-4">
              {isGwpWrapItem ? (
                <div className="flex flex-col items-end text-right lg:flex-row lg:items-center lg:gap-2 rtl:items-start rtl:text-left">
                  <p className="text-text-danger text-[16px] font-semibold">
                    {t("delivery.freeGiftLabel")}
                  </p>
                  <LocalizedPrice
                    containerProps={{
                      className:
                        "text-text-secondary text-xs font-light line-through",
                    }}
                    price={priceLabel}
                  />
                </div>
              ) : (
                <LocalizedPrice
                  containerProps={{
                    className: "text-text-primary text-sm font-semibold",
                  }}
                  price={priceLabel}
                  valueProps={{ className: "ms-[1px]" }}
                />
              )}

              {!isGwpWrapItem && (
                <button
                  aria-label="delete gift wrap"
                  className="text-text-danger flex shrink-0 items-center justify-center"
                  disabled={removeMutation.isPending}
                  onClick={handleDelete}
                  type="button"
                >
                  {removeMutation.isPending ? (
                    <Spinner className="size-4" variant="dark" />
                  ) : (
                    <Image alt="delete" className="h-5 w-4" src={TrashIcon} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no wrap item, show add button (pic2)
  return (
    <div className="mt-2 flex h-[45px] items-center justify-between rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="bg-bg-default inline-flex size-6 items-center justify-center rounded-full">
          <Image alt="gift" className="h-5 w-5" src={GiftIcon} />
        </span>
        <span className="text-text-primary text-[15px] font-medium">
          {t("delivery.giftWrapping")}
        </span>
      </div>
      <button
        aria-label="add gift wrap"
        className="text-text-secondary items-center justify-center"
        disabled={isNavigating}
        onClick={() => {
          startNavigation(() => {
            router.push(ROUTES.CHECKOUT.ADD_GIFT_WRAPPING);
            onToggle?.(!isEnabled);
          });
        }}
        type="button"
      >
        {isNavigating ? (
          <Spinner className="size-4" variant="dark" />
        ) : (
          <Image alt="add" className="h-5 w-5" src={PlusIcon} />
        )}
      </button>
    </div>
  );
}
