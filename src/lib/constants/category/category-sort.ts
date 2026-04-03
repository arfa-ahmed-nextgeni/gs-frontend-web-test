export enum CategorySortKey {
  Newest = "news_from_date",
  // Offers = "offers",
  PriceHighToLow = "priceHighToLow",
  PriceLowToHigh = "priceLowToHigh",
  Relevance = "relevance",
}

export const CATEGORY_SORT_OPTIONS: {
  label: string;
  value: CategorySortKey;
}[] = [
  { label: "relevance", value: CategorySortKey.Relevance },
  { label: "new", value: CategorySortKey.Newest },
  // { label: "offers", value: CategorySortKey.Offers },
  { label: "priceHighToLow", value: CategorySortKey.PriceHighToLow },
  { label: "priceLowToHigh", value: CategorySortKey.PriceLowToHigh },
];
