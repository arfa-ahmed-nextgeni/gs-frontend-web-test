import { ProductType } from "@/lib/constants/product/product-details";

import type { GetProductDetailsQuery } from "@/catalog-service-graphql/graphql";

const PERFUME_ATTRIBUTE_KEYWORDS = ["perfume", "fragrance"];

type ProductData = NonNullable<
  NonNullable<GetProductDetailsQuery["products"]>[number]
>;

export const isPerfumeAttributeSet = (attributeSet: string) => {
  const lowerAttributeSet = attributeSet.toLowerCase();

  return (
    attributeSet === "Default" ||
    PERFUME_ATTRIBUTE_KEYWORDS.some((word) => lowerAttributeSet.includes(word))
  );
};

/**
 * Determines product type from product data
 * Uses the same logic as ProductDetailsModel constructor
 * @param product - Product data from GraphQL query (products or productView)
 * @returns ProductType (Beauty, Perfume, GiftCard, or EGiftCard)
 */
export function determineProductType(
  product: ProductData
):
  | ProductType.Beauty
  | ProductType.EGiftCard
  | ProductType.GiftCard
  | ProductType.Perfume {
  /**
   * Helper function to get attribute value from product attributes
   * Reuses the same logic as Helper.getAttributeValue
   */
  const getAttributeValue = (
    attributes:
      | Array<{ name?: null | string; value?: null | string } | null>
      | null
      | undefined,
    attributeName: string,
    defaultValue: string = ""
  ): string => {
    if (!attributes) return defaultValue;
    const attr = attributes.find((a) => a?.name === attributeName);
    return attr?.value || defaultValue;
  };

  const productType = getAttributeValue(product.attributes, "product_type", "");
  const attributeSet = getAttributeValue(
    product.attributes,
    "attribute_set",
    ""
  );

  const type: ProductType =
    productType === "giftcard"
      ? ProductType.GiftCard
      : productType === "virtual"
        ? ProductType.EGiftCard
        : isPerfumeAttributeSet(attributeSet)
          ? ProductType.Perfume
          : ProductType.Beauty;

  return type;
}
