"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { useAnalytics } from "@/lib/analytics";
import {
  trackCatBeautyItemsSold,
  trackCatFragranceItemsSold,
  trackCatMixItemsSold,
  trackGPurchase,
  trackPurchase,
  trackPurchaseSuccess,
  trackRevenue,
  trackTabbyPurchaseSuccess,
  trackTamaraPurchaseSuccess,
} from "@/lib/analytics/events";
import {
  buildInstallmentPurchasePropertiesFromOrder,
  buildPurchasePropertiesFromOrder,
} from "@/lib/analytics/utils/build-properties";
import { Order } from "@/lib/types/ui-types";
import {
  isTabbyPaymentMethod,
  isTamaraPaymentMethod,
} from "@/lib/utils/payment-method";

/**
 * Client component to track purchase event
 * Placed in order-confirmation page to track when purchase is successful
 * Only tracks once per page load, even if order data updates
 * When initialCustomer is passed (from server), sets user properties before firing
 * so user_id is available for attribution even when client auth state hasn't settled
 */
export function PurchaseTracker({
  order,
  orderId,
  productsType,
}: {
  order: Order;
  orderId: string;
  productsType: "beauty" | "fragrance" | "mix";
}) {
  const hasTracked = useRef(false);
  const { hasUserPropertiesSet } = useAnalytics();

  const categoryItemsSoldProperties = {
    item_count: order.products?.length ?? 0,
    item_ids: order.products
      ?.map((item) => String(item.productId ?? item.id))
      .filter(Boolean)
      .join(","),
    order_id: orderId || order.tracking_number || String(order.id),
    total: order.total ?? 0,
  };

  const trackProductsTypeEvent = useEffectEvent(() => {
    if (productsType === "fragrance") {
      trackCatFragranceItemsSold(categoryItemsSoldProperties);
    } else if (productsType === "beauty") {
      trackCatBeautyItemsSold(categoryItemsSoldProperties);
    } else {
      trackCatMixItemsSold(categoryItemsSoldProperties);
    }
  });

  const trackPurchaseEvent = useEffectEvent(() => {
    if (hasTracked.current || !order || !orderId) {
      return;
    }

    // Determine shipping type from order
    const shippingType =
      order.deliveryLabel?.toLowerCase().includes("click collect") ||
      order.deliveryLabel?.toLowerCase().includes("pickup")
        ? "Click Collect"
        : "Home Delivery";

    // Build purchase properties from order data
    const purchaseProperties = buildPurchasePropertiesFromOrder(
      order,
      shippingType
    );
    trackPurchase(purchaseProperties);

    // Track purchase_success event with required properties
    const purchaseSuccessProperties = {
      ...purchaseProperties,
      shipping_type: purchaseProperties.shipping_type || shippingType,
    };
    trackPurchaseSuccess(purchaseSuccessProperties);
    // Track g_purchase event with same properties
    trackGPurchase(purchaseSuccessProperties);
    // Track Revenue event with same properties
    trackRevenue(purchaseSuccessProperties);

    // Track tabby_purchase_success if payment method is Tabby
    const paymentMethod = order.paymentMethodType || "";
    if (isTabbyPaymentMethod(paymentMethod)) {
      const installmentProperties = buildInstallmentPurchasePropertiesFromOrder(
        order,
        shippingType
      );
      trackTabbyPurchaseSuccess(installmentProperties);
    }

    // Track tamara_purchase_success if payment method is Tamara
    if (isTamaraPaymentMethod(paymentMethod)) {
      const installmentProperties = buildInstallmentPurchasePropertiesFromOrder(
        order,
        shippingType
      );
      trackTamaraPurchaseSuccess(installmentProperties);
    }
  });

  useEffect(() => {
    if (!hasUserPropertiesSet) return;
    trackPurchaseEvent();
    trackProductsTypeEvent();
  }, [hasUserPropertiesSet]);

  return null;
}
