import { useEffect, useMemo, useState } from "react";

import { isEqual } from "lodash";

import { Product, Variation, VariationOption } from "@/lib/types/ui-types";
import { getVariations } from "@/lib/utils/get-variations";

function useProductVariations(
  product?: Product,
  useVariations?: Variation[],
  attributes: { [key: string]: string } = {}
) {
  // Initialize attributes from product variations
  const initialAttributes: { [key: string]: string } = useMemo(() => {
    const attrs: { [key: string]: string } = {};
    if (product?.variations && Array.isArray(product.variations)) {
      product.variations.forEach((variation: Variation) => {
        const attrSlug = variation?.attribute?.slug;
        const attrValue = variation?.value;
        if (attrSlug && attrValue) {
          attrs[attrSlug] = attrValue;
        }
      });
    }
    return attrs;
  }, [product]);

  // Safely extract variations
  const variations = useMemo(() => {
    //check condition to overwrite value variations
    if (useVariations) return getVariations(useVariations);
    return getVariations(
      Array.isArray(product?.variations) ? product.variations : []
    );
  }, [useVariations, product?.variations]);

  // Store selected variation
  const [errorAttributes, setErrorAttributes] = useState<boolean>(false);
  const [selectedVariation, setSelectedVariation] = useState<
    undefined | VariationOption
  >(undefined);

  // Check if all required attributes are selected
  const isSelected = useMemo(() => {
    return getVariations(
      Array.isArray(product?.variations) ? product.variations : []
    );
  }, [variations, attributes]);

  const sortedAttributeValues = useMemo(
    () => Object.values(attributes).sort(),
    [attributes]
  );

  // Update selectedVariation when attributes change
  useEffect(() => {
    if (!isSelected) return;
    setErrorAttributes(false);

    // Get variation options from product
    const variationOptions = Array.isArray(product?.variation_options)
      ? product.variation_options
      : [];
    const newSelectedVariation = variationOptions.find((o: VariationOption) =>
      isEqual(o.options.map((v) => v.value).sort(), sortedAttributeValues)
    );

    setSelectedVariation(newSelectedVariation);
  }, [isSelected, product, sortedAttributeValues]);

  return {
    errorAttributes,
    initialAttributes,
    isSelected,
    selectedVariation,
    variations,
  };
}

export default useProductVariations;
