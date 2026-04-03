"use client";

import { useStoreConfig } from "@/contexts/store-config-context";
import { useCart } from "@/contexts/use-cart";

import { OrderActions } from "./order-actions";
import { OrderPerks } from "./order-perks";
import { OrderSummary } from "./order-summary";

export const OrderSummaryCard = () => {
  const { cart } = useCart();
  const { storeConfig } = useStoreConfig();

  const currencyCode = storeConfig?.currencyCode || "SAR";
  const freeShippingThreshold = Number(storeConfig?.freeShippingThreshold);
  const subTotal = cart?.subTotalPrice ?? 0;
  const grandTotal = cart?.grandTotalPrice ?? 0;
  const serviceFee = cart?.serviceFee ?? 0;
  const shippingFee = cart?.shippingFee ?? 0;
  const baseShippingFee = cart?.baseShippingFee ?? 0;
  const rewardPointsValue = cart?.appliedRewardPoints
    ? cart?.rewardPointsBaseValue
    : undefined;
  const mokafaaDiscount = cart?.mokafaaDiscount ?? 0;

  if (!cart?.items || cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <OrderActions currencyCode={currencyCode} />

      <OrderSummary
        baseShippingFee={baseShippingFee}
        currencyCode={currencyCode}
        freeShippingThreshold={freeShippingThreshold}
        grandTotal={grandTotal}
        mokafaaDiscount={mokafaaDiscount}
        rewardPointsValue={rewardPointsValue}
        serviceFee={serviceFee}
        shippingFee={shippingFee}
        subTotal={subTotal}
      />

      <OrderPerks currencyCode={currencyCode} grandTotal={grandTotal} />
    </>
  );
};
