"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { CheckoutHeader } from "@/components/checkout/checkout-header/checkout-header";
import { OrderInformation } from "@/components/orders/order-information";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { trackCartClear } from "@/lib/analytics/events";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { Order } from "@/lib/types/ui-types";
import {
  getSessionStorage,
  removeSessionStorage,
} from "@/lib/utils/session-storage";

const orderConfirmationBackTrapState = "orderConfirmationBackTrap";

type OrderConfirmationHistoryState = {
  [orderConfirmationBackTrapState]?: true;
};

export default function OrderConfirmationContent({
  logoSlot,
  order,
  orderId,
}: {
  logoSlot?: ReactNode;
  order: Order;
  orderId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale() as Locale;
  const t = useTranslations("OrderConfirmation");
  const { setSelectedLockerAddressType } = useCheckoutContext();

  useEffect(() => {
    // Invalidate cart cache to ensure fresh data for next order
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CART.ROOT(locale),
    });
    trackCartClear();
    setSelectedLockerAddressType(null);
  }, [locale, queryClient, setSelectedLockerAddressType]);

  // Handle browser back button to navigate to cart
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const skipCartRedirect = getSessionStorage(
        SessionStorageKey.CHECKOUT_PRODUCT_REVIEW_BACK_NAVIGATION
      );

      if (skipCartRedirect) {
        removeSessionStorage(
          SessionStorageKey.CHECKOUT_PRODUCT_REVIEW_BACK_NAVIGATION
        );
        return;
      }

      event.preventDefault();
      router.push(ROUTES.CART.ROOT);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  useEffect(() => {
    if (pathname.includes("/checkout/order-confirmation/reviews/add/")) {
      return;
    }

    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? (window.history.state as OrderConfirmationHistoryState)
        : {};

    if (currentState[orderConfirmationBackTrapState]) {
      return;
    }

    // Push a state to the history so we can intercept back navigation.
    window.history.pushState(
      { ...currentState, [orderConfirmationBackTrapState]: true },
      ""
    );
  }, [pathname]);

  return (
    <div className="bg-[#F7F8FA]">
      <CheckoutHeader logoSlot={logoSlot} />

      <Container className="pb-[140px] md:pb-24">
        <OrderInformation order={order} orderId={orderId} />
      </Container>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E8EBF0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] justify-end px-4 py-4">
          <Link className="w-full max-w-[390px]" href={ROUTES.ROOT}>
            <Button
              className="mb-[55px] h-[55px] w-full bg-[#374957] text-[20px] font-medium text-white hover:bg-[#2f3f4f] md:mb-auto"
              size="lg"
            >
              {t("backToHome")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
