"use client";

import { useTranslations } from "next-intl";

import { BulletDeliveryToastTrigger } from "@/components/bullet-delivery/bullet-delivery-toast-trigger";
import { useCart } from "@/contexts/use-cart";
import { Link } from "@/i18n/navigation";
import { trackContinueShopping } from "@/lib/analytics/events";

import { CartEmptyState } from "./cart-empty-state";
import { CartPopulatedState } from "./cart-populated-state";
import { CartPageSkeletonContent } from "./skeletons";

export const CartContent = ({
  suggestedProducts,
}: {
  suggestedProducts: React.ReactNode;
}) => {
  const { cart, isLoading } = useCart();
  const items = cart?.items ?? [];
  const itemCount = cart?.totalQuantity ?? 0;
  const giftsCount = items.reduce(
    (total, item) => (item.isGwp ? total + item.quantity : total),
    0
  );

  const t = useTranslations("CartPage");

  return (
    <div>
      {/* Header */}
      <div className="hidden lg:ml-7 lg:flex">
        <Link
          aria-label={t("continueShopping")}
          className="text-(--color-text-primary) flex items-center gap-1 text-sm font-medium"
          href="/"
          onClick={() => {
            // Track continue_shopping when continue shopping button is clicked
            trackContinueShopping("cart");
          }}
        >
          {t("continueShopping")}
        </Link>
      </div>

      {/* Title + Count */}
      {itemCount > 0 && (
        <header className="mb-4 mt-4 pl-4 lg:mt-10 lg:px-0 rtl:pr-4">
          <h1 className="text-(--color-text-primary) text-[25px] font-semibold leading-tight">
            {t("shoppingBag")}
          </h1>

          <div className="mt-1 flex flex-row items-center gap-5">
            {itemCount > 0 && (
              <p className="text-text-secondary text-sm">
                {t("itemCount", { count: itemCount })}
                {giftsCount > 0 && ` ${t("giftsCount", { giftsCount })}`}
              </p>
            )}
          </div>
        </header>
      )}

      <BulletDeliveryToastTrigger />

      {/* Content */}
      {isLoading ? (
        <CartPageSkeletonContent />
      ) : itemCount === 0 ? (
        <CartEmptyState />
      ) : (
        <CartPopulatedState
          items={items}
          suggestedProducts={suggestedProducts}
        />
      )}
    </div>
  );
};
