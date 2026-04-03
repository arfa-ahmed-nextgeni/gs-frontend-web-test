"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { CheckoutHeader } from "@/components/checkout/checkout-header/checkout-header";
import { OrderInformation } from "@/components/orders/order-information";
import Container from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { useCheckoutContext } from "@/contexts/checkout-context";
import { Link, useRouter } from "@/i18n/navigation";
import { Locale } from "@/lib/constants/i18n";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { ROUTES } from "@/lib/constants/routes";
import { Order } from "@/lib/types/ui-types";

export default function OrderConfirmationContent({
  order,
  orderId,
}: {
  order: Order;
  orderId: string;
}) {
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
    setSelectedLockerAddressType(null);
  }, [locale, queryClient, setSelectedLockerAddressType]);

  // Handle browser back button to navigate to cart
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      router.push(ROUTES.CART.ROOT);
    };

    // Push a state to the history so we can intercept back navigation
    window.history.pushState({}, "");

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);
  return (
    <div className="bg-[#F7F8FA]">
      <CheckoutHeader />

      <Container>
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
