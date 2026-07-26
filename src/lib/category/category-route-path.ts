const BRANDS_ROOT_SLUG = "brands";

/**
 * Maps a Magento category `url_path` to the route it is served at.
 *
 * Categories live under the `/c/` prefix, EXCEPT the brands subtree, which
 * has its own top-level route (`/brands`, `/brands/{slug}`) — matching the
 * original site structure and the URLs already indexed by search engines.
 * Centralising this here keeps canonical URLs, hreflang, pagination and
 * breadcrumbs consistent across both `/c/[...slug]` and `/brands/[...slug]`.
 *
 * Examples:
 * - `perfumes`            -> `/c/perfumes`
 * - `brands`              -> `/brands`
 * - `brands/ghost-nose`   -> `/brands/ghost-nose`
 */
export function categoryUrlPathToRoutePath(urlPath: string): string {
  if (
    urlPath === BRANDS_ROOT_SLUG ||
    urlPath.startsWith(`${BRANDS_ROOT_SLUG}/`)
  ) {
    return `/${urlPath}`;
  }

  return `/c/${urlPath}`;
}
