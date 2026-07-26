"use client";

import { useEffect, useRef } from "react";

import { trackMyWishlist } from "@/lib/analytics/events";

/**
 * Client component to track wishlist page view event
 * Placed in wishlist page to track when user open wishlist side bar
 * Only tracks once per page load, even if wishlist data refetches
 */
export function WishlistTracker({
  wishlistProducts,
}: {
  wishlistProducts: any[];
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current || !wishlistProducts?.length) {
      return;
    }

    hasTracked.current = true;
    trackMyWishlist(wishlistProducts);
  }, [wishlistProducts]);

  return null;
}
