import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  buildCategoryRouteMetadata,
  CategoryRouteContent,
} from "@/components/category/category-route-content";
import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

// Brand listing pages live at `/brands/{slug}` (their original, indexed
// structure) rather than under the `/c/` category prefix. The Magento
// category still resolves by its full `url_path` (`brands/{slug}`), so we
// prepend the `brands` segment before handing off to the shared category
// route renderer.
const BRANDS_ROOT_SLUG = "brands";

export default async function BrandCategoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/brands/[...slug]">) {
  const { locale, slug } = await params;

  if (slug[0] === ROUTE_PLACEHOLDER) {
    notFound();
  }

  return (
    <CategoryRouteContent
      locale={locale}
      searchParams={searchParams}
      slug={toCategorySlug(slug)}
    />
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/brands/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;

  if (slug[0] === ROUTE_PLACEHOLDER) {
    return {
      description: "The requested category could not be found.",
      title: "Category Not Found",
    };
  }

  return buildCategoryRouteMetadata({
    locale,
    searchParams,
    slug: toCategorySlug(slug),
  });
}

export function generateStaticParams() {
  // Brand listing pages are rendered on demand (dynamicParams), matching
  // the previous /c/brands/{slug} behaviour — they were never prerendered.
  // Eagerly enumerating every brand across every store here would push
  // thousands of slow category renders into the build and time it out.
  // Only the placeholder is emitted so the route exists at build time.
  return [{ slug: [ROUTE_PLACEHOLDER] }];
}

// Prepend the `brands` root segment so the Magento category resolves by its
// full url_path (`brands/{slug}`). The build-time placeholder slug is passed
// through untouched so the shared renderer's placeholder guard handles it.
function toCategorySlug(slug: string[]): string[] {
  return slug[0] === ROUTE_PLACEHOLDER ? slug : [BRANDS_ROOT_SLUG, ...slug];
}
