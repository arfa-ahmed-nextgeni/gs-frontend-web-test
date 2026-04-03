"use client";

import { useEffect } from "react";

import { trackMyWishlist } from "@/lib/analytics/events";

/**
 * Client component to track wishlist page view event
 * Placed in wishlist page to track when user open wishlist side bar
 */
export function WishlistTracker() {
  useEffect(() => {
    trackMyWishlist();
  }, []);

  return null;
}
