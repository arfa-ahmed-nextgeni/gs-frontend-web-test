/**
 * Catalog product search is limited to this many products per query.
 * Pagination must not expose pages beyond floor(cap / pageSize).
 */
export const CATEGORY_LISTING_MAX_PRODUCTS_PER_QUERY = 10_000 as const;

/** Default page size for category listing (must match listing actions). */
export const CATEGORY_LISTING_DEFAULT_PAGE_SIZE = 20;

export function clampCategoryListingPage(
  page: number,
  pageSize: number
): number {
  const maxPage = getCategoryListingMaxPage(pageSize);
  return Math.min(Math.max(1, page), maxPage);
}

/**
 * Caps API-reported total pages so the UI never offers pages the backend cannot serve.
 */
export function getCategoryListingCappedTotalPages(
  apiTotalPages: number,
  pageSize: number
): number {
  if (!Number.isFinite(apiTotalPages) || apiTotalPages < 1) {
    return 0;
  }

  return Math.min(apiTotalPages, getCategoryListingMaxPage(pageSize));
}

export function getCategoryListingMaxPage(pageSize: number): number {
  if (!Number.isFinite(pageSize) || pageSize < 1) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(CATEGORY_LISTING_MAX_PRODUCTS_PER_QUERY / pageSize)
  );
}
