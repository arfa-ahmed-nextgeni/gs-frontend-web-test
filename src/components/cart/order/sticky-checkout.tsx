"use client";

import { useTransition } from "react";

import { useIsMutating } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { useAuthUI } from "@/contexts/auth-ui-context";
import { useCart } from "@/contexts/use-cart";
import { useUI } from "@/contexts/use-ui";
import { useCustomerQuery } from "@/hooks/queries/use-customer-query";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { setSuppressRegistration } from "@/lib/utils/auth-redirect";

export const StickyCheckoutBar = () => {
  const t = useTranslations("CartPage");
  const router = useRouter();
  const [isNavigationPending, startNavigationTransition] = useTransition();
  const isMobile = useIsMobile();
  const { showOtpLoginPopup } = useAuthUI();
  const { isAuthorized } = useUI();
  const { data: currentCustomer, isLoading: isCustomerLoading } =
    useCustomerQuery();
  const { cart, isFetching, isLoading } = useCart();
  const items = cart?.items ?? [];

  const isCartMutating = useIsMutating({
    predicate: (mutation) => {
      const key = mutation.options.mutationKey;
      if (!Array.isArray(key)) return false;
      return key[0] === "cart";
    },
  });

  const isCouponMutating = useIsMutating({
    mutationKey: ["coupon"],
  });

  const isMokafaaMutating = useIsMutating({
    mutationKey: ["mokafaa"],
  });

  const isCartOperationInProgress =
    isFetching ||
    isLoading ||
    isCartMutating > 0 ||
    isCouponMutating > 0 ||
    isMokafaaMutating > 0;

  if (items.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        "border-border-base bg-bg-default pb-safe fixed inset-x-0 bottom-0 z-40 border-t"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-center px-5 pb-[calc(var(--bottom-nav-height,60px)+20px)] pt-5 lg:justify-end lg:px-0 lg:py-3 lg:pb-3"
        )}
      >
        <button
          className={cn(
            "bg-text-primary text-bg-body lg:w-97.5 font-regular flex h-12 w-full max-w-sm items-center justify-center rounded-xl text-xl shadow-md transition-all duration-300 ease-in-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:text-xl"
          )}
          disabled={isCartOperationInProgress || isNavigationPending}
          onClick={() => {
            const isLoggedIn = Boolean(currentCustomer) || isAuthorized;

            if (!isLoggedIn && !isCustomerLoading) {
              setSuppressRegistration();

              if (isMobile) {
                startNavigationTransition(() => {
                  router.push(ROUTES.CUSTOMER.LOGIN);
                });
              } else {
                showOtpLoginPopup();
              }
              return;
            }

            startNavigationTransition(() => {
              router.push(ROUTES.CHECKOUT.ROOT);
            });
          }}
          type="button"
        >
          {isNavigationPending ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            t("proceedToCheckout")
          )}
        </button>
      </div>
    </div>
  );
};
