import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";

import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

export const setProductCardClickOrigin = ({
  categoryId,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  searchTerm,
}: ProductCardClickOriginProps) => {
  if (lpRow !== undefined && lpColumn !== undefined) {
    clickOriginTrackingManager.setClickOrigin({
      column: lpColumn,
      extra: lpExtra,
      inner_position: lpInnerPosition,
      origin: "lp",
      row: lpRow,
    });

    return;
  }

  if (categoryId !== undefined && position !== undefined) {
    clickOriginTrackingManager.setClickOrigin({
      categoryId,
      origin: "plp",
      position,
    });

    return;
  }

  if (searchTerm && position !== undefined) {
    clickOriginTrackingManager.setClickOrigin({
      origin: "search",
      position,
      term: searchTerm,
    });
  }
};
