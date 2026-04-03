import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { BrandsAlphabetNav } from "@/components/category/brands-section/brands-alphabet-nav";
import { BrandsHeader } from "@/components/category/brands-section/brands-header";
import { BrandsLetterGroup } from "@/components/category/brands-section/brands-letter-group";
import { BrandsLetterGroupStatic } from "@/components/category/brands-section/brands-letter-group-static";
import { BrandsAlphabetNavSkeleton } from "@/components/category/brands-section/skeletons/brands-alphabet-nav-skeleton";
import { AsyncBoundary } from "@/components/common/async-boundary";
import Container from "@/components/shared/container";
import { BrandsLetterProvider } from "@/contexts/brands-letter-context";
import { getBrandsPageData } from "@/lib/actions/category/get-brands-data";
import { initializePageLocale } from "@/lib/utils/locale";
import { generateAbsoluteCanonicalUrl } from "@/lib/utils/seo";

import type { Locale } from "@/lib/constants/i18n";

export default async function BrandsPage({
  params,
}: PageProps<"/[locale]/c/brands">) {
  const { locale } = await params;

  initializePageLocale(locale);

  const brandsPageData = await getBrandsPageData({
    locale: locale as Locale,
  });

  if (!brandsPageData) {
    return null;
  }

  const {
    categoryAlphabetLinksMap,
    categoryAvailableLettersMap,
    categoryBrandsMap,
    defaultAlphabetLinks,
    defaultAvailableLetters,
    defaultGroupedBrands,
    navigationItems,
  } = brandsPageData;

  return (
    <BrandsLetterProvider>
      <BrandsHeader brandsCategories={navigationItems} />
      <Container className="my-7.5 lg:gap-7.5 flex flex-row-reverse items-start gap-2.5 lg:flex-col lg:items-center">
        <AsyncBoundary fallback={<BrandsAlphabetNavSkeleton />}>
          <BrandsAlphabetNav
            categoryAlphabetLinksMap={categoryAlphabetLinksMap}
            defaultAlphabetLinks={defaultAlphabetLinks}
          />
        </AsyncBoundary>
        <AsyncBoundary
          fallback={
            <BrandsLetterGroupStatic
              defaultAvailableLetters={defaultAvailableLetters}
              defaultGroupedBrands={defaultGroupedBrands}
            />
          }
        >
          <BrandsLetterGroup
            categoryAvailableLettersMap={categoryAvailableLettersMap}
            categoryBrandsMap={categoryBrandsMap}
            defaultAvailableLetters={defaultAvailableLetters}
            defaultGroupedBrands={defaultGroupedBrands}
            fallbackComponent={
              <BrandsLetterGroupStatic
                defaultAvailableLetters={defaultAvailableLetters}
                defaultGroupedBrands={defaultGroupedBrands}
              />
            }
          />
        </AsyncBoundary>
      </Container>
    </BrandsLetterProvider>
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/c/brands">): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "BrandsCategoryPage.metaData",
  });

  const canonicalUrl = generateAbsoluteCanonicalUrl({
    locale: locale as Locale,
    pathname: "/c/brands",
  });

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      description: t("description"),
      images: [
        {
          height: 630,
          url: `${canonicalUrl}/logo-512x512.png`,
          width: 1200,
        },
      ],
      locale: locale,
      siteName: "Golden Scent",
      title: t("title"),
      type: "website",
      url: canonicalUrl,
    },
    robots: {
      follow: true,
      index: true,
    },
    title: t("title"),
    twitter: {
      card: "summary_large_image",
      description: t("description"),
      images: [`${canonicalUrl}/logo-512x512.png`],
      title: t("title"),
    },
  };
}
