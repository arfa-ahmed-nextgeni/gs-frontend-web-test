"use client";

import { ComponentProps } from "react";

import { useProductCard } from "@/components/product/product-card/product-card-context";
import { Link } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";

interface ProductCardImageLinkProps extends ComponentProps<typeof Link> {
  searchTerm?: string;
}

/**
 * Client wrapper component for ProductCardImage link
 * Tracks click origin (PLP or search) when user clicks on product card image
 * Must be used within ProductCardProvider context
 */
export function ProductCardImageLink(linkProps: ProductCardImageLinkProps) {
  // useProductCard will throw if not within ProductCardProvider, which is expected
  // since this component should only be used within ProductCard
  const {
    categoryId,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    position,
    searchTerm,
  } = useProductCard();

  const handleClick = () => {
    // Track LP click origin if row and column are available (landing page/home page)
    if (lpRow !== undefined && lpColumn !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        column: lpColumn,
        extra: lpExtra,
        inner_position: lpInnerPosition,
        origin: "lp",
        row: lpRow,
      });
    }
    // Track PLP click origin if categoryId and position are available
    else if (categoryId !== undefined && position !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        categoryId,
        origin: "plp",
        position,
      });
    }
    // Track search click origin if searchTerm and position are available
    else if (searchTerm && position !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        origin: "search",
        position,
        term: searchTerm,
      });
    }
  };

  return <Link {...linkProps} onClick={handleClick} />;
}
