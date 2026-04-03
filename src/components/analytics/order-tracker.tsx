"use client";

import { useEffect, useRef } from "react";

import { trackTrackOrder } from "@/lib/analytics/events";
import { buildTrackOrderPropertiesFromOrder } from "@/lib/analytics/utils/build-properties";
import { Order } from "@/lib/models/customer-orders";

/**
 * Client component to track track-order event
 * Placed in view-order page to track when users view an order
 * Only tracks once per order load, even if order data updates
 */
export function OrderTracker({ order }: { order: null | Order | undefined }) {
  const hasTracked = useRef(false);
  const trackedOrderId = useRef<null | string>(null);

  useEffect(() => {
    // Only track once per order load and when order data is available
    if (
      hasTracked.current ||
      !order?.id ||
      trackedOrderId.current === order.id
    ) {
      return;
    }

    // Build track-order properties from order data
    const orderProperties = buildTrackOrderPropertiesFromOrder(order);
    trackTrackOrder(orderProperties);
    hasTracked.current = true;
    trackedOrderId.current = order.id;

    return () => {
      hasTracked.current = false;
      trackedOrderId.current = null;
    };
  }, [order]);

  return null;
}
