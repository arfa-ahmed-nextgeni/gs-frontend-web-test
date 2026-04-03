"use client";

import { useEffect, useState } from "react";

import { useIsMutating } from "@tanstack/react-query";
import { useLocale } from "next-intl";

import { RedeemMokafaaPointsDialog } from "@/components/cart/alrajhi-mokafaa/redeem-mokafaa-points-dialog";
import { ApplyCouponDialog } from "@/components/cart/order/order-actions/apply-coupon-dialog";
import { ApplyRewardPoints } from "@/components/cart/order/order-actions/apply-reward-points";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/use-cart";
import { Locale } from "@/lib/constants/i18n";
import { MUTATION_KEYS } from "@/lib/constants/mutation-keys";
import { mutationPrefix } from "@/lib/utils/mutation-key";

import { ActionList } from "./order-summary-helpers";

interface OrderActionsProps {
  currencyCode: string;
}

export function OrderActions({ currencyCode }: OrderActionsProps) {
  const { cart } = useCart();

  const locale = useLocale() as Locale;

  // Fix hydration mismatch by only showing mokafaa after client-side hydration
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mokafaaDiscount = cart?.mokafaaDiscount;
  const appliedCoupon = cart?.appliedCoupons?.[0];
  const isCouponApplied = Boolean(appliedCoupon);
  const isMokafaaApplied = Boolean(mokafaaDiscount);
  const isMokafaaEnabled = isHydrated && (cart?.mokafaaEnabledForWeb || false);
  const isRewardPointsApplied = cart?.appliedRewardPoints ?? false;

  const isRewardPointsMutating = useIsMutating({
    mutationKey: mutationPrefix(
      MUTATION_KEYS.CART.APPLY_REWARD_POINTS({ locale })
    ),
  });

  return (
    <Card className="bg-bg-default mb-3 overflow-hidden rounded-xl border-0 px-1 py-0 shadow-none lg:block">
      <CardContent className="p-0">
        <ActionList>
          {/* Apply Coupon */}
          <ApplyCouponDialog
            appliedCoupon={appliedCoupon}
            applyCouponDisabled={isMokafaaEnabled && isMokafaaApplied}
          />

          {/* Redeem Mokafaa */}
          {isMokafaaEnabled && (
            <RedeemMokafaaPointsDialog
              mokafaaDiscount={mokafaaDiscount}
              redeemMokafaaDisabled={
                isCouponApplied ||
                isRewardPointsApplied ||
                isRewardPointsMutating > 0
              }
            />
          )}

          <ApplyRewardPoints currencyCode={currencyCode} />
        </ActionList>
      </CardContent>
    </Card>
  );
}
