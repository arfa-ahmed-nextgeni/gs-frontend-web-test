"use client";

import { use, useEffect } from "react";

import { trackProductReview } from "@/lib/analytics/events";
import { buildProductPropertiesFromDetails } from "@/lib/analytics/utils/build-properties";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { ProductDetailsModel } from "@/lib/models/product-details-model";
import {
  ServiceResultError,
  ServiceResultOk,
} from "@/lib/types/service-result";
import { isOk } from "@/lib/utils/service-result";
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

/**
 * Client component to track product review page view event
 * Placed in product review page to track when users view product reviews.
 * Does not fire when the user just came back from the add review page.
 */
export function ProductReviewTracker({
  productDetailsPromise,
}: {
  productDetailsPromise: Promise<
    ServiceResultError | ServiceResultOk<ProductDetailsModel>
  >;
}) {
  const productDetails = use(productDetailsPromise);

  const productProperties =
    isOk(productDetails) && productDetails.data
      ? buildProductPropertiesFromDetails(productDetails.data)
      : undefined;

  useEffect(() => {
    if (!productProperties) return;

    const cameFromAdd = getSessionStorage(
      SessionStorageKey.ANALYTICS_PRODUCT_REVIEW_CAME_FROM_ADD
    );
    removeSessionStorage(
      SessionStorageKey.ANALYTICS_PRODUCT_REVIEW_CAME_FROM_ADD
    );
    if (cameFromAdd) return;

    trackProductReview(productProperties);
  }, [productProperties]);

  return null;
}

/**
 * Call when user navigates to the add review page so we skip firing product_review
 * when they return to the reviews list.
 */
export function setCameFromAddReviewPage(): void {
  setSessionStorage(
    SessionStorageKey.ANALYTICS_PRODUCT_REVIEW_CAME_FROM_ADD,
    "1"
  );
}
