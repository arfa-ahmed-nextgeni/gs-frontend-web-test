export const PRODUCT_REVIEWS_SORT_OPTIONS = [
  "newest-first",
  "oldest-first",
  "rating-high-to-low",
  "rating-low-to-high",
] as const;

export type ProductReviewsSortOption =
  (typeof PRODUCT_REVIEWS_SORT_OPTIONS)[number];

export const PRODUCT_REVIEWS_SORT_CONFIG: Record<
  ProductReviewsSortOption,
  { direction: "asc" | "desc"; field: string }
> = {
  "newest-first": { direction: "desc", field: "date" },
  "oldest-first": { direction: "asc", field: "date" },
  "rating-high-to-low": { direction: "desc", field: "rating" },
  "rating-low-to-high": { direction: "asc", field: "rating" },
};
