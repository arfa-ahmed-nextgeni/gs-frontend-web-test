"use client";

import { useEffect, useEffectEvent, useRef } from "react";

import { trackViewProduct } from "@/lib/analytics/events";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

interface ProductTrackerProps {
  product: ProductDetailsModel;
}

/**
 * Client component to track product detail page view event
 * Placed in product page to track when users view a product
 */
export function ProductTracker({ product }: ProductTrackerProps) {
  const hasTracked = useRef(false);

  const trackViewProductEvent = useEffectEvent(() => {
    if (hasTracked.current) {
      return;
    }

    trackViewProduct(buildProductPropertiesFromDetails(product));
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
