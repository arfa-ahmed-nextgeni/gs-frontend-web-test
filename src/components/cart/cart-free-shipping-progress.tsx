"use client";

import { useTranslations } from "next-intl";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { Progress } from "@/components/ui/progress";
import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/price";

export const CartFreeShippingProgress = () => {
  const { cart, cartHasItems } = useCart();
  const { storeConfig } = useStoreConfig();
  const t = useTranslations("CartPage.drawer");

  const freeShippingThreshold = Number(storeConfig?.freeShippingThreshold);

  if (!cartHasItems || !isFinite(freeShippingThreshold)) return null;

  const cartTotal = cart?.subTotalPrice ?? 0;

  const remaining = Math.max(freeShippingThreshold - cartTotal, 0);
  const freeShippingSuccess = remaining === 0;

  const progressValue =
    freeShippingThreshold > 0
      ? Math.min((cartTotal / freeShippingThreshold) * 100, 100)
      : 0;

  return (
    <div className="shrink-0 pt-5">
      <div className="mx-5 flex flex-col gap-2.5">
        <Progress className="w-full" value={progressValue} />
        <span
          className={cn("text-text-secondary text-center text-xs font-normal", {
            "text-text-accent": freeShippingSuccess,
          })}
        >
          {t.rich(
            freeShippingSuccess
              ? "freeShippingSuccess"
              : "freeShippingSuggestion",
            {
              b: (chunks) => (
                <span className="font-semibold rtl:font-bold">{chunks}</span>
              ),
              price: () => (
                <LocalizedPrice
                  price={formatPrice({
                    amount: remaining,
                    currencyCode: storeConfig?.currencyCode ?? "",
                  })}
                />
              ),
            }
          )}
        </span>
      </div>
    </div>
  );
};
