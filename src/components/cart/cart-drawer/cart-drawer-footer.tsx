"use client";

import { useTranslations } from "next-intl";

import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouteMatch } from "@/hooks/use-route-match";
import { useRouter } from "@/i18n/navigation";
import { trackContinueShopping } from "@/lib/analytics/events";
import { ROUTES } from "@/lib/constants/routes";

export const CartDrawerFooter = () => {
  const router = useRouter();
  const t = useTranslations("CartPage.drawer");

  const isMobile = useIsMobile();

  const { closeCartDrawer } = useCartDrawer();
  const { isCategory, isHome, isProduct, pathname } = useRouteMatch();

  const handleViewCart = () => {
    router.push(ROUTES.CART.ROOT);
    closeCartDrawer();
  };

  const handleKeepShopping = () => {
    // Track continue_shopping when continue shopping button is clicked
    const mappedSource: "cart-drawer" | "lp" | "pdp" | "plp" = isProduct
      ? "pdp"
      : pathname.includes("/lp/")
        ? "lp"
        : isCategory
          ? "plp"
          : isHome
            ? "lp"
            : "cart-drawer";

    trackContinueShopping(mappedSource);
    if (isProduct) {
      router.back();
    }
    closeCartDrawer();
  };

  return (
    <div className="bg-bg-default flex shrink-0 flex-row gap-2.5 p-5 lg:flex-col-reverse">
      <button
        className="text-text-primary h-12.5 border-border-base flex-1 rounded-xl border bg-transparent text-xl font-medium lg:block lg:flex-none lg:border-none"
        onClick={handleKeepShopping}
      >
        {t(isMobile ? "keepShopping" : "continueShopping")}
      </button>
      <button
        className="bg-btn-bg-primary text-text-ghost h-12.5 flex size-full flex-1 items-center justify-center rounded-xl text-xl font-medium lg:block lg:flex-none"
        onClick={handleViewCart}
      >
        {t(isMobile ? "viewBag" : "viewCart")}
      </button>
    </div>
  );
};
