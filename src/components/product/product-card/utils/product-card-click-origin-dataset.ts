import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

export function parseProductCardClickOrigin(
  serializedClickOrigin: null | string
): null | ProductCardClickOriginProps {
  if (!serializedClickOrigin) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      serializedClickOrigin
    ) as null | ProductCardClickOriginProps;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeProductCardClickOrigin(
  props: ProductCardClickOriginProps
) {
  const {
    categoryId,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    position,
    searchTerm,
  } = props;

  const isLandingPageClick = lpRow !== undefined && lpColumn !== undefined;
  const isCategoryClick = categoryId !== undefined && position !== undefined;
  const isSearchClick = Boolean(searchTerm) && position !== undefined;

  if (!isLandingPageClick && !isCategoryClick && !isSearchClick) {
    return undefined;
  }

  return JSON.stringify({
    categoryId,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    position,
    searchTerm,
  });
}
