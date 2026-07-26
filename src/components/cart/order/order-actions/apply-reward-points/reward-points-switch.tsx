"use client";

import { useOptimistic, useTransition } from "react";

import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/contexts/use-cart";
import { useApplyRewardPointsToCart } from "@/hooks/mutations/cart/use-apply-reward-points-to-cart";
import { useRemoveRewardPointsFromCart } from "@/hooks/mutations/cart/use-remove-reward-points-from-cart";
import {
  trackTalonRedeemPointsAttempt,
  trackTalonRedeemPointsCancel,
  trackTalonRedeemPointsError,
  trackTalonRedeemPointsOk,
} from "@/lib/analytics/events";
import { buildCartProperties } from "@/lib/analytics/utils/build-properties";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export function RewardPointsSwitch() {
  const { cart } = useCart();
  const checked = cart?.appliedRewardPoints ?? false;

  const rewardThreshold = cart?.rewardThreshold ?? 0;
  const isThresholdNotMet = rewardThreshold > 0;
  const isMokafaaApplied = Boolean(cart?.mokafaaDiscount);

  const [isPending, startTransition] = useTransition();
  const [optimisticChecked, addOptimistic] = useOptimistic(
    checked,
    (_currentState, optimisticValue: boolean) => optimisticValue
  );

  const { isPending: isApplyPending, mutateAsync: applyRewardPoints } =
    useApplyRewardPointsToCart();
  const { isPending: isRemovePending, mutateAsync: removeRewardPoints } =
    useRemoveRewardPointsFromCart();

  const isLoading = isPending || isApplyPending || isRemovePending;
  const isDisabled = isLoading || isThresholdNotMet || isMokafaaApplied;

  function handleCheckedChange(newChecked: boolean) {
    if (isDisabled || !cart) return;

    startTransition(async () => {
      addOptimistic(newChecked);

      if (newChecked) {
        trackTalonRedeemPointsAttempt(buildCartProperties(cart));

        try {
          const result = await applyRewardPoints();

          if (isError(result) || isUnauthenticated(result)) {
            trackTalonRedeemPointsError(
              buildCartProperties(cart),
              isError(result) ? result.error : "unauthenticated"
            );
          } else {
            trackTalonRedeemPointsOk(buildCartProperties(result.data ?? cart));
          }
        } catch (error) {
          trackTalonRedeemPointsError(
            buildCartProperties(cart),
            error instanceof Error ? error.message : "unknown_error"
          );
        }
      } else {
        trackTalonRedeemPointsCancel(buildCartProperties(cart));

        await removeRewardPoints();
      }
    });
  }

  return (
    <div className="flex flex-row items-center gap-2">
      {isPending && <Spinner size={18} variant="dark" />}
      <Switch
        aria-checked={optimisticChecked}
        checked={optimisticChecked}
        disabled={isDisabled}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}
