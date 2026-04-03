"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { useProductDetails } from "@/contexts/product-details-context";
import { trackViewProduct } from "@/lib/analytics/events";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";

/**
 * Client component to track product detail page view event
 * Placed in product page to track when users view a product
 */
export function ProductTracker() {
  const { product, selectedProduct } = useProductDetails();
  const hasTracked = useRef(false);

  const trackViewProductEvent = useEffectEvent(() => {
    if (hasTracked.current) {
      return;
    }

    trackViewProduct(
      buildProductPropertiesFromDetails(selectedProduct, product)
    );
    hasTracked.current = true;
  });

  useEffect(() => {
    trackViewProductEvent();

    return () => {
      hasTracked.current = false;
    };
  }, []);

  return null;
}
