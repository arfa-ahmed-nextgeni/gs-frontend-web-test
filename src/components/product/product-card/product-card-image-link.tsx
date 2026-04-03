import type { ComponentProps } from "react";

import { serializeProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin-dataset";
import { Link } from "@/i18n/navigation";
import { PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

import type { ProductCardClickOriginProps } from "@/components/product/product-card/types/product-card-click-origin-types";

interface ProductCardImageLinkProps
  extends ComponentProps<typeof Link>, ProductCardClickOriginProps {}

export function ProductCardImageLink({
  categoryId,
  lpColumn,
  lpExtra,
  lpInnerPosition,
  lpRow,
  position,
  searchTerm,
  ...linkProps
}: ProductCardImageLinkProps) {
  const serializedClickOrigin = serializeProductCardClickOrigin({
    categoryId,
    lpColumn,
    lpExtra,
    lpInnerPosition,
    lpRow,
    position,
    searchTerm,
  });

  return (
    <Link
      {...linkProps}
      {...(serializedClickOrigin
        ? { [PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE]: serializedClickOrigin }
        : {})}
    />
  );
}
