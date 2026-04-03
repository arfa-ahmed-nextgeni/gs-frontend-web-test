"use client";

import { useTranslations } from "next-intl";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { useCart } from "@/contexts/use-cart";
import { cn } from "@/lib/utils";

export const CartDrawerSubtotal = () => {
  const t = useTranslations("CartPage.drawer");

  const { cart, isFetching } = useCart();

  return (
    <div className="border-border-base flex shrink-0 flex-row items-center justify-between border-y px-5 py-3.5">
      <div className="flex flex-row items-center gap-2.5">
        <p className="text-text-primary text-xl font-medium leading-none">
          {t("subtotal")}
        </p>
        <p
          className={cn("text-text-tertiary text-xs font-normal leading-none", {
            "animate-pulse": isFetching,
          })}
        >
          {t("numberOfItems", { count: `${cart?.totalQuantity || 0}` })}
        </p>
      </div>
      <div
        className={cn("text-text-primary font-medium", {
          "animate-pulse": isFetching,
        })}
      >
        <LocalizedPrice
          containerProps={{ className: "text-xl" }}
          currencySymbolProps={{ className: "mr-[4px] text-2xl" }}
          price={cart?.subTotalFormattedPrice}
        />
      </div>
    </div>
  );
};
