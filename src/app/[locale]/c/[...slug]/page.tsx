import { Metadata } from "next";

import {
  buildCategoryRouteMetadata,
  CategoryRouteContent,
} from "@/components/category/category-route-content";
import { collectCategoryStaticSlugs } from "@/lib/category/static-params-extractors";

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/c/[...slug]">) {
  const { locale, slug } = await params;

  return (
    <CategoryRouteContent
      locale={locale}
      searchParams={searchParams}
      slug={slug}
    />
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/c/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;

  return buildCategoryRouteMetadata({ locale, searchParams, slug });
}

export async function generateStaticParams({
  params,
}: {
  params: Awaited<LayoutProps<"/[locale]">["params"]>;
}) {
  const slugs = await collectCategoryStaticSlugs({ locale: params.locale });
  return slugs.map((slug) => ({ slug }));
}
