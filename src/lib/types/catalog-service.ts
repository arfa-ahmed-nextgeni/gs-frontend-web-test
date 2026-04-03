/**
 * TypeScript interfaces for Adobe Catalog Service API
 * Product Search and Facets
 */

// ============================================================================
// Search Filter Types
// ============================================================================

// Import generated types from codegen
import { SortEnum } from "@/catalog-service-graphql/graphql";

export enum AggregationType {
  INTELLIGENT = "INTELLIGENT",
  PINNED = "PINNED",
  POPULAR = "POPULAR",
}

export interface Aggregation {
  /**
   * The attribute code of the filter item (e.g., "brand", "price")
   */
  attribute: string;
  /**
   * A container that divides the data into manageable groups
   */
  buckets: Array<CategoryViewBucket | RangeBucket | ScalarBucket>;
  /**
   * The filter name displayed in layered navigation
   */
  title: string;
  /**
   * Identifies the data type of the aggregation
   */
  type?: AggregationType;
}

// ============================================================================
// Facet/Aggregation Types
// ============================================================================

export interface Bucket {
  title: string;
}

export interface CategoryViewBucket extends Bucket {
  count: number;
  id: string;
  name: string;
  path?: string;
}

export interface ComplexProductView {
  __typename: "ComplexProductView";
  attributes?: ProductViewAttribute[];
  description?: string;
  externalId: string;
  id: string;
  images?: ProductViewImage[];
  inStock?: boolean;
  lowStock?: boolean;
  name: string;
  options?: ProductViewOption[];
  priceRange: ProductPriceRange;
  shortDescription?: string;
  sku: string;
  urlKey?: string;
}

export interface DynamicCategoryFilter {
  attribute: string;
  defaultOpen?: boolean;
  dialogTitle: string;
  id: string;
  isSearchable: boolean;
  options: DynamicFilterOption[];
  shortTitle: string;
  title: string;
}

export interface DynamicFilterOption {
  count: number;
  label: string;
  value: string;
}

// ============================================================================
// Product View Types
// ============================================================================

export interface Money {
  currency: string;
  value: number;
}

export interface ProductPrice {
  final: {
    amount: Money;
  };
  regular: {
    amount: Money;
  };
}

export interface ProductPriceRange {
  maximum?: ProductPrice;
  minimum: ProductPrice;
}

export interface ProductSearchItem {
  productView: ProductView;
}

export interface ProductSearchParams {
  /**
   * Specifies which page of results to return
   */
  currentPage?: number;
  /**
   * Identifies product attributes and conditions to filter on
   */
  filter?: SearchClauseInput[];
  /**
   * The maximum number of results to return at once
   */
  pageSize?: number;
  /**
   * Phrase to search for in product catalog (can be category ID/UID)
   */
  phrase: string;
  /**
   * Attributes and direction to sort on
   */
  sort?: ProductSearchSortInput[];
}

export interface ProductSearchResponse {
  /**
   * Details about the static and dynamic facets relevant to the search
   */
  facets?: Aggregation[];
  /**
   * An array of products returned by the query
   */
  items?: ProductSearchItem[];
  /**
   * Information for rendering pages of search results
   */
  page_info?: SearchResultPageInfo;
  /**
   * An array of strings that might include merchant-defined synonyms
   */
  related_terms?: string[];
  /**
   * An array of strings that include product and category names similar to the search query
   */
  suggestions?: string[];
  /**
   * The total number of products returned that matched the query
   */
  total_count?: number;
}

export interface ProductSearchSortInput {
  /**
   * The attribute code to sort by
   */
  attribute: string;
  /**
   * Sort direction: ASC or DESC
   */
  direction: SortEnum;
}

export type ProductView = ComplexProductView | SimpleProductView;

export interface ProductViewAttribute {
  label?: string;
  name: string;
  roles?: string[];
  value: string;
}

export interface ProductViewImage {
  label?: string;
  roles?: string[];
  url: string;
}

// ============================================================================
// Product Search Response Types
// ============================================================================

export interface ProductViewOption {
  id: string;
  multi?: boolean;
  required?: boolean;
  title: string;
  values: ProductViewOptionValue[];
}

export interface ProductViewOptionValue {
  id: string;
  inStock?: boolean;
  title: string;
  type?: string;
  value?: string;
}

export interface RangeBucket extends Bucket {
  count: number;
  from: number;
  to?: number;
}

// ============================================================================
// Request Parameters
// ============================================================================

export interface ScalarBucket extends Bucket {
  count: number;
  id: string;
}

// ============================================================================
// Attribute Metadata Types
// ============================================================================

export interface SearchClauseInput {
  /**
   * The attribute code of a product attribute
   */
  attribute: string;
  /**
   * Attribute value should contain the specified string
   */
  contains?: string;
  /**
   * Exact string match
   */
  eq?: string;
  /**
   * Array of string values to filter on (for multi-select filters like brands)
   */
  in?: string[];
  /**
   * Numeric range filter (for price)
   */
  range?: SearchRangeInput;
  /**
   * Attribute value should start with the specified string
   */
  startsWith?: string;
}

export interface SearchRangeInput {
  /**
   * The minimum value to filter on
   */
  from?: number;
  /**
   * The maximum value to filter on
   */
  to?: number;
}

export interface SearchResultPageInfo {
  current_page?: number;
  page_size?: number;
  total_pages?: number;
}

// ============================================================================
// Transformed Types (for UI consumption)
// ============================================================================

export interface SimpleProductView {
  __typename: "SimpleProductView";
  attributes?: ProductViewAttribute[];
  description?: string;
  externalId: string;
  id: string;
  images?: ProductViewImage[];
  inStock?: boolean;
  lowStock?: boolean;
  name: string;
  price: ProductPrice;
  shortDescription?: string;
  sku: string;
  urlKey?: string;
}
