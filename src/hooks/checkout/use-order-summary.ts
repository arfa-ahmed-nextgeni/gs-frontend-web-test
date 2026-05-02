import { useMemo } from "react";

import { useCart } from "@/contexts/use-cart";

export function useOrderSummary() {
  const { cart } = useCart();

  const totals = useMemo(() => {
    if (!cart) {
      return {
        baseShippingFee: 0,
        grandTotal: 0,
        hasSelectedShippingMethod: false,
        serviceFee: 0,
        shippingFee: 0,
        subtotal: 0,
      };
    }

    return {
      baseShippingFee: cart.baseShippingFee || 0,
      grandTotal: cart.grandTotalPrice || 0,
      hasSelectedShippingMethod: cart.hasSelectedShippingMethod,
      serviceFee: cart.serviceFee || 0,
      shippingFee: cart.shippingFee || 0,
      subtotal: cart.subTotalPrice || 0,
    };
  }, [cart]);

  // Calculate deductions
  const deductions = useMemo(() => {
    if (!cart) {
      return {
        discount: 0,
        mokafaa: 0,
        totalSavings: 0,
        wallet: 0,
      };
    }

    const mokafaa = cart.mokafaaDiscount || 0;
    const discount = cart.discount || 0;
    const wallet = cart.appliedRewardPoints
      ? cart.rewardPointsBaseValue || 0
      : 0;
    const totalSavings = discount + mokafaa + wallet;

    return {
      discount,
      mokafaa,
      totalSavings,
      wallet,
    };
  }, [cart]);

  // Calculate total due
  const totalDue = useMemo(() => {
    if (!cart) return 0;

    const grandTotal = cart.grandTotalPrice || 0;
    const walletDeduction = deductions.wallet || 0;
    const mokafaaDeduction = deductions.mokafaa || 0;
    return Math.max(0, grandTotal - walletDeduction - mokafaaDeduction);
  }, [cart, deductions.wallet, deductions.mokafaa]);

  return {
    deductions,
    totalDue,
    totals,
  };
}
