import { parsePageParam } from "@/lib/category/query";
import {
  CATEGORY_LISTING_DEFAULT_PAGE_SIZE,
  getCategoryListingMaxPage,
} from "@/lib/constants/category/category-listing-cap";
import { QueryParamsKey } from "@/lib/constants/query-params";

/**
 * When the URL `page` exceeds the maximum page allowed by the product cap,
 * returns the path+query the client should be redirected to (same filters, clamped page).
 * Otherwise returns null.
 */
export function getCategoryListingHrefIfPageExceedsProductCap(
  routePath: string,
  search: Record<string, string | string[] | undefined>,
  pageSize = CATEGORY_LISTING_DEFAULT_PAGE_SIZE
): null | string {
  const requested = parsePageParam(search[QueryParamsKey.Page]);
  const maxPage = getCategoryListingMaxPage(pageSize);

  if (requested <= maxPage) {
    return null;
  }

  const params = new URLSearchParams();

  for (const [key, raw] of Object.entries(search)) {
    if (raw === undefined || key === QueryParamsKey.Page) {
      continue;
    }

    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (value !== undefined && value !== "") {
        params.append(key, value);
      }
    }
  }

  if (maxPage > 1) {
    params.set(QueryParamsKey.Page, String(maxPage));
  }

  const queryString = params.toString();

  return queryString ? `${routePath}?${queryString}` : routePath;
}
