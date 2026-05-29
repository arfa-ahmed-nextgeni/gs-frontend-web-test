import { redirect } from "@/i18n/navigation";
import { getCategoryListingHrefIfPageExceedsProductCap } from "@/lib/category/category-listing-redirect";
import { CATEGORY_LISTING_DEFAULT_PAGE_SIZE } from "@/lib/constants/category/category-listing-cap";
import { type Locale } from "@/lib/constants/i18n";

interface CategoryListingRedirectGuardProps {
  locale: Locale;
  routePath: string;
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>;
}

export async function CategoryListingRedirectGuard({
  locale,
  routePath,
  searchParamsPromise,
}: CategoryListingRedirectGuardProps) {
  const search = await searchParamsPromise;
  const href = getCategoryListingHrefIfPageExceedsProductCap(
    routePath,
    search,
    CATEGORY_LISTING_DEFAULT_PAGE_SIZE
  );

  if (href) {
    redirect({ href, locale });
  }

  return null;
}
