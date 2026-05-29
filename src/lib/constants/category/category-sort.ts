export enum CategorySortKey {
  Newest = "news_from_date",
  // Offers = "offers",
  Position = "position",
  PriceHighToLow = "priceHighToLow",
  PriceLowToHigh = "priceLowToHigh",
  Relevance = "relevance",
}

export type ProductListingSortMode = "category" | "search";

export const CATEGORY_DEFAULT_SORT_KEY = CategorySortKey.Position;
export const SEARCH_DEFAULT_SORT_KEY = CategorySortKey.Relevance;

export function getDefaultSortKey(
  listingType: ProductListingSortMode
): CategorySortKey {
  return listingType === "search"
    ? SEARCH_DEFAULT_SORT_KEY
    : CATEGORY_DEFAULT_SORT_KEY;
}

export function getDefaultSortLabel(
  listingType: ProductListingSortMode
): string {
  return listingType === "search" ? "relevance" : "position";
}

export function isDefaultSortForListing(
  sortBy: string | undefined,
  listingType: ProductListingSortMode
): boolean {
  return !sortBy || sortBy === getDefaultSortKey(listingType);
}

export const CATEGORY_SORT_OPTIONS: {
  label: string;
  value: CategorySortKey;
}[] = [
  { label: "position", value: CategorySortKey.Position },
  { label: "relevance", value: CategorySortKey.Relevance },
  { label: "new", value: CategorySortKey.Newest },
  // { label: "offers", value: CategorySortKey.Offers },
  { label: "priceHighToLow", value: CategorySortKey.PriceHighToLow },
  { label: "priceLowToHigh", value: CategorySortKey.PriceLowToHigh },
];
