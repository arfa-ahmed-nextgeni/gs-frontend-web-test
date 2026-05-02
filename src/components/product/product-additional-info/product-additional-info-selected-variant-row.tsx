"use client";

import { ProductAdditionalInfoRow } from "@/components/product/product-additional-info/product-additional-info-row";
import { useProductDetails } from "@/contexts/product-details-context";

export const ProductAdditionalInfoSelectedVariantRow = ({
  label,
}: {
  label: string;
}) => {
  const { selectedProduct } = useProductDetails();

  if (!selectedProduct.label) {
    return null;
  }

  return (
    <ProductAdditionalInfoRow label={label} value={selectedProduct.label} />
  );
};
