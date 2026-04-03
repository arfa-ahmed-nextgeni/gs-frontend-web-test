/**
 * Utility functions to transform data between UI state and Catalog Service API formats
 */

import { SortEnum } from "@/catalog-service-graphql/graphql";
import {
  Aggregation,
  CategoryViewBucket,
  DynamicCategoryFilter,
  DynamicFilterOption,
  ProductSearchSortInput,
  ProductView,
  RangeBucket,
  ScalarBucket,
} from "@/lib/types/catalog-service";

// ============================================================================
// Filter Transformation Functions
// ============================================================================

/**
 * Convert array of Catalog Service Aggregations to DynamicCategoryFilters
 */
export function convertFacetsToDynamicFilters(
  facets: Aggregation[] | undefined
): DynamicCategoryFilter[] {
  if (!facets || facets.length === 0) {
    return [];
  }

  return facets
    .map((facet) => convertFacetToDynamicFilter(facet))
    .filter((filter): filter is DynamicCategoryFilter => filter !== null);
}

/**
 * Convert Catalog Service Aggregation to DynamicCategoryFilter
 */
export function convertFacetToDynamicFilter(
  facet: Aggregation
): DynamicCategoryFilter | null {
  if (!facet.attribute) {
    return null;
  }

  if (
    facet.attribute === "price" &&
    (!facet.buckets || facet.buckets.length === 0)
  ) {
    const config = getFilterConfig(facet.attribute);
    return {
      attribute: facet.attribute,
      defaultOpen: config?.defaultOpen ?? false,
      dialogTitle: config?.dialogTitle || facet.title,
      id: config?.id || facet.attribute,
      isSearchable: config?.isSearchable ?? false,
      options: [],
      shortTitle: config?.shortTitle || facet.title,
      title: facet.title,
    };
  }

  if (!facet.buckets || facet.buckets.length === 0) {
    return null;
  }

  const config = getFilterConfig(facet.attribute);
  const options = facet.buckets
    .map((bucket) => convertBucketToOption(bucket))
    .filter((option): option is DynamicFilterOption => option !== null);

  if (options.length === 0) {
    return null;
  }

  return {
    attribute: facet.attribute,
    defaultOpen: config?.defaultOpen ?? false,
    dialogTitle: config?.dialogTitle || facet.title,
    id: config?.id || facet.attribute,
    isSearchable: config?.isSearchable ?? false,
    options,
    shortTitle: config?.shortTitle || facet.title,
    title: facet.title,
  };
}

// ============================================================================
// Facet Transformation Functions
// ============================================================================

/**
 * Convert UI sort option to Catalog Service ProductSearchSortInput format
 */
export function convertSortToProductSearchSort(
  sortBy?: string
): ProductSearchSortInput[] | undefined {
  if (!sortBy || sortBy === "relevance") return undefined;

  const sortMap: Record<string, ProductSearchSortInput[]> = {
    news_from_date: [{ attribute: "news_to_date", direction: SortEnum.Desc }],
    offers: [{ attribute: "price", direction: SortEnum.Desc }],
    popular: [{ attribute: "name", direction: SortEnum.Asc }],
    priceHighToLow: [{ attribute: "price", direction: SortEnum.Desc }],
    priceLowToHigh: [{ attribute: "price", direction: SortEnum.Asc }],
  };

  return sortMap[sortBy];
}

/**
 * Extract price bounds from facets
 */
export function extractPriceBoundsFromFacets(
  facets: Aggregation[] | undefined
): { max: number; min: number } | undefined {
  if (!facets || facets.length === 0) {
    return undefined;
  }

  const priceFacet = facets.find((facet) => facet.attribute === "price");
  if (!priceFacet || !priceFacet.buckets) {
    return undefined;
  }

  let min = Infinity;
  let max = -Infinity;

  for (const bucket of priceFacet.buckets) {
    const rangeBucket = bucket as RangeBucket;
    if (rangeBucket.from !== undefined && rangeBucket.from !== null) {
      min = Math.min(min, rangeBucket.from);
    }
    if (rangeBucket.to !== undefined && rangeBucket.to !== null) {
      max = Math.max(max, rangeBucket.to);
    }
  }

  if (min === Infinity || max === -Infinity) {
    return undefined;
  }

  return { max, min };
}

/**
 * Extract main product image URL
 */
export function extractProductImage(product: ProductView): string {
  if (!product.images || product.images.length === 0) {
    return "";
  }

  const mainImage = product.images.find(
    (img) => img.roles && img.roles.includes("image")
  );

  if (mainImage) {
    return mainImage.url;
  }

  return product.images[0].url;
}

/**
 * Extract price information from ProductView
 */
export function extractProductPrice(product: ProductView): {
  currency: string;
  discountPercent?: number;
  finalPrice: number;
  regularPrice: number;
} {
  let currency = "SAR";
  let finalPrice = 0;
  let regularPrice = 0;

  if (!product) {
    return { currency, finalPrice, regularPrice };
  }

  const productTypeAttribute = product.attributes?.find(
    (attr) => attr.name === "product_type"
  );
  const giftcardAmountAttribute = product.attributes?.find(
    (attr) => attr.name === "giftcard_amount_values"
  );

  if (
    productTypeAttribute?.value === "virtual" &&
    giftcardAmountAttribute?.value
  ) {
    try {
      const giftcardData = JSON.parse(giftcardAmountAttribute.value);
      if (
        giftcardData.values &&
        Array.isArray(giftcardData.values) &&
        giftcardData.values.length > 0
      ) {
        const firstGiftcardOption = giftcardData.values[0];
        finalPrice = firstGiftcardOption.price || 0;
        regularPrice = finalPrice;
        currency = "SAR";
      }
    } catch (error) {
      console.error("Error parsing giftcard_amount_values:", error);
    }
  }

  if (finalPrice === 0) {
    const productAny = product as any;
    if (productAny.priceRange) {
      const rawCurrency =
        productAny.priceRange?.minimum?.final?.amount?.currency;
      currency = rawCurrency && rawCurrency !== "NONE" ? rawCurrency : "SAR";
      finalPrice = productAny.priceRange?.minimum?.final?.amount?.value || 0;
      regularPrice =
        productAny.priceRange?.minimum?.regular?.amount?.value || finalPrice;
    } else if (productAny.price) {
      const rawCurrency = productAny.price?.final?.amount?.currency;
      currency = rawCurrency && rawCurrency !== "NONE" ? rawCurrency : "SAR";
      finalPrice = productAny.price?.final?.amount?.value || 0;
      regularPrice = productAny.price?.regular?.amount?.value || finalPrice;
    }
  }

  const discountPercent =
    regularPrice > finalPrice
      ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
      : undefined;

  return {
    currency,
    discountPercent,
    finalPrice,
    regularPrice,
  };
}

export function getAttributeValue<T>(
  attributes: any[],
  attributeName: string,
  defaultValue: T
): T {
  try {
    const attribute = attributes?.find((attr) => attr?.name === attributeName);
    return attribute?.value || defaultValue;
  } catch (error) {
    console.error(`Error getting attribute "${attributeName}":`, error);
    return defaultValue;
  }
}

/**
 * Extract product attribute value by name
 */
export function getProductAttribute(
  product: ProductView,
  attributeName: string
): string | undefined {
  if (!product.attributes) {
    return undefined;
  }

  const attribute = product.attributes.find(
    (attr) => attr.name === attributeName
  );
  const value =
    typeof attribute?.value === "string"
      ? attribute?.value?.trim()
      : attribute?.value;
  return value && value.length > 0 ? value : undefined;
}

/**
 * Check if product is in stock
 */
export function isProductInStock(product: ProductView): boolean {
  return product.inStock ?? true;
}

export function parseAttributeValue<T>(
  attributes: any[],
  attributeName: string,
  defaultValue: T
): T {
  try {
    const attribute = attributes?.find((attr) => attr?.name === attributeName);
    return attribute?.value ? JSON.parse(attribute.value) : defaultValue;
  } catch (error) {
    console.error(`Error parsing attribute "${attributeName}":`, error);
    return defaultValue;
  }
}

/**
 * Convert a single bucket to DynamicFilterOption
 */
function convertBucketToOption(bucket: any): DynamicFilterOption | null {
  if (!bucket.title || bucket.count === undefined) {
    return null;
  }

  if (isScalarBucket(bucket)) {
    return {
      count: bucket.count,
      label: bucket.title,
      value: bucket.id,
    };
  }

  if (isRangeBucket(bucket)) {
    const from = bucket.from;
    const to = bucket.to ?? "∞";
    return {
      count: bucket.count,
      label: `${from}-${to}`,
      value: `${from}-${to}`,
    };
  }

  if (isCategoryViewBucket(bucket)) {
    return {
      count: bucket.count,
      label: bucket.name || bucket.title,
      value: bucket.id,
    };
  }

  return {
    count: bucket.count || 0,
    label: bucket.title,
    value: bucket.title.toLowerCase().replace(/\s+/g, "-"),
  };
}

// ============================================================================
// Product Transformation Functions
// ============================================================================

/**
 * Get filter configuration metadata for a given attribute
 */
function getFilterConfig(
  attribute: string
): null | Partial<DynamicCategoryFilter> {
  const configs: Record<string, Partial<DynamicCategoryFilter>> = {
    area_of_application: {
      defaultOpen: true,
      dialogTitle: "areaOfApplication",
      id: "areaOfApplication",
      isSearchable: true,
      shortTitle: "Application",
      title: "Area of Application",
    },
    brand_new: {
      defaultOpen: true,
      dialogTitle: "shopByBrand",
      id: "shopByBrand",
      isSearchable: true,
      shortTitle: "Brands",
      title: "Brand",
    },
    character: {
      defaultOpen: true,
      dialogTitle: "shopByCharacter",
      id: "character",
      isSearchable: true,
      shortTitle: "Character",
      title: "Character",
    },
    concentration: {
      defaultOpen: true,
      dialogTitle: "concentration",
      id: "concentration",
      isSearchable: true,
      shortTitle: "Concentration",
      title: "Concentration",
    },
    gender: {
      defaultOpen: true,
      dialogTitle: "shopByGender",
      id: "shopByGender",
      isSearchable: false,
      shortTitle: "Gender",
      title: "Gender",
    },
    makeup_color: {
      defaultOpen: true,
      dialogTitle: "makeUpColor",
      id: "makeUpColor",
      isSearchable: true,
      shortTitle: "Color",
      title: "Makeup Color",
    },
    makeup_type: {
      defaultOpen: true,
      dialogTitle: "makeUpType",
      id: "makeUpType",
      isSearchable: true,
      shortTitle: "Type",
      title: "Makeup Type",
    },
    perfume_notes: {
      defaultOpen: true,
      dialogTitle: "perfumeNotes",
      id: "perfumeNotes",
      isSearchable: true,
      shortTitle: "Notes",
      title: "Perfume Notes",
    },
    price: {
      defaultOpen: true,
      dialogTitle: "priceRange",
      id: "price",
      isSearchable: false,
      shortTitle: "Price",
      title: "Price Range",
    },
    product_category: {
      defaultOpen: true,
      dialogTitle: "productCategory",
      id: "productCategory",
      isSearchable: true,
      shortTitle: "Category",
      title: "Product Category",
    },
    product_type: {
      defaultOpen: true,
      dialogTitle: "shopByType",
      id: "productType",
      isSearchable: true,
      shortTitle: "Type",
      title: "Product Type",
    },
  };

  return configs[attribute] || null;
}

/**
 * Check if bucket is a CategoryViewBucket
 */
function isCategoryViewBucket(
  bucket: any
): bucket is { __typename?: string } & CategoryViewBucket {
  return (
    bucket.__typename === "CategoryView" ||
    (typeof bucket.id === "string" &&
      typeof bucket.name === "string" &&
      typeof bucket.count === "number")
  );
}

/**
 * Check if bucket is a RangeBucket
 */
function isRangeBucket(
  bucket: any
): bucket is { __typename?: string } & RangeBucket {
  return (
    bucket.__typename === "RangeBucket" ||
    (typeof bucket.from === "number" && typeof bucket.count === "number")
  );
}

/**
 * Check if bucket is a ScalarBucket
 */
function isScalarBucket(
  bucket: any
): bucket is { __typename?: string } & ScalarBucket {
  return (
    bucket.__typename === "ScalarBucket" ||
    (typeof bucket.id === "string" && typeof bucket.count === "number")
  );
}
