import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import {
  getBrands,
  groupBrandsAlphabetically,
} from "@/lib/actions/category/get-brands";
import { getPageLandingData } from "@/lib/actions/contentful/page-landing";
import { CacheTags } from "@/lib/constants/cache/tags";
import { PageLandingSlug } from "@/lib/constants/contentful";
import { ARABIC_ALPHABETS, Locale } from "@/lib/constants/i18n";
import { NavigationItem } from "@/lib/models/site-navigation";
import { Brand, GroupedBrands } from "@/lib/types/brands";
import { getLocaleInfo } from "@/lib/utils/locale";
import { isError } from "@/lib/utils/service-result";

export type BrandsPageData = {
  categoryAlphabetLinksMap: Record<string, string[]>;
  categoryAvailableLettersMap: Record<string, string[]>;
  categoryBrandsMap: Record<string, GroupedBrands>;
  defaultAlphabetLinks: string[];
  defaultAvailableLetters: string[];
  defaultGroupedBrands: GroupedBrands;
  navigationItems: NavigationItem[];
};

export const getBrandsPageData = ({ locale }: { locale: Locale }) =>
  getBrandsPageDataCached(locale);

const getBrandsPageDataCached = cache(
  async (locale: Locale): Promise<BrandsPageData | null> => {
    "use cache";
    cacheTag(CacheTags.Contentful);
    cacheTag(CacheTags.Magento);

    const { language } = getLocaleInfo(locale);

    const [pageLandingResult, getBrandsResult] = await Promise.allSettled([
      getPageLandingData({
        locale,
        slug: PageLandingSlug.BrandsDesktop,
      }),
      getBrands({ locale }),
    ]);

    if (
      pageLandingResult.status === "rejected" ||
      getBrandsResult.status === "rejected"
    ) {
      return null;
    }

    if (isError(getBrandsResult.value)) {
      return null;
    }

    const allBrands = getBrandsResult.value.data;

    // Flatten all brands from grouped structure for filtering
    const allBrandsFlat: Brand[] = Object.values(allBrands).flat();

    // Create mappings: category id -> brands, category id -> alphabet links, category id -> available letters
    const categoryBrandsMap: Record<string, GroupedBrands> = {};
    const categoryAlphabetLinksMap: Record<string, string[]> = {};
    const categoryAvailableLettersMap: Record<string, string[]> = {};

    const navigationItems = pageLandingResult.value.siteNavigation?.items || [];

    for (const category of navigationItems) {
      let categoryBrands: Brand[];

      if (category.brandsUrlKeys && category.brandsUrlKeys.length > 0) {
        // Filter brands whose urlKey is in brandsUrlKeys array
        categoryBrands = allBrandsFlat.filter((brand) =>
          category.brandsUrlKeys!.includes(brand.urlKey)
        );
      } else {
        // If brandsUrlKeys is undefined, include all brands
        categoryBrands = allBrandsFlat;
      }

      // Group the filtered brands alphabetically
      const groupedCategoryBrands = groupBrandsAlphabetically(categoryBrands);
      categoryBrandsMap[category.id] = groupedCategoryBrands;

      // Calculate available letters for this category (for filtering by letter)
      const categoryAvailableLetters = Object.keys(
        groupedCategoryBrands
      ).filter(
        (letter) =>
          groupedCategoryBrands[letter] &&
          groupedCategoryBrands[letter].length > 0
      );

      const categoryEnglishLetters = categoryAvailableLetters
        .filter((l) => /^[A-Z]$/.test(l))
        .sort();

      const categoryArabicLetters = categoryAvailableLetters
        .filter((letter) =>
          ARABIC_ALPHABETS.includes(letter as (typeof ARABIC_ALPHABETS)[number])
        )
        .sort(
          (a, b) =>
            ARABIC_ALPHABETS.indexOf(a as (typeof ARABIC_ALPHABETS)[number]) -
            ARABIC_ALPHABETS.indexOf(b as (typeof ARABIC_ALPHABETS)[number])
        );

      const categoryHasSymbols = categoryAvailableLetters.includes("#");

      const categoryAlphabetLinks =
        language === "ar"
          ? [
              ...categoryArabicLetters,
              ...categoryEnglishLetters,
              ...(categoryHasSymbols ? ["#"] : []),
            ]
          : [
              ...categoryEnglishLetters,
              ...categoryArabicLetters,
              ...(categoryHasSymbols ? ["#"] : []),
            ];

      categoryAlphabetLinksMap[category.id] = categoryAlphabetLinks;
      // Use sorted alphabet links for available letters to maintain proper order
      categoryAvailableLettersMap[category.id] = categoryAlphabetLinks;
    }

    // Default: all brands (when no category is selected)
    const defaultGroupedBrands = allBrands;
    const defaultAvailableLettersRaw = Object.keys(defaultGroupedBrands).filter(
      (letter) =>
        defaultGroupedBrands[letter] && defaultGroupedBrands[letter].length > 0
    );

    const defaultEnglishLetters = defaultAvailableLettersRaw
      .filter((l) => /^[A-Z]$/.test(l))
      .sort();

    const defaultArabicLetters = defaultAvailableLettersRaw
      .filter((letter) =>
        ARABIC_ALPHABETS.includes(letter as (typeof ARABIC_ALPHABETS)[number])
      )
      .sort(
        (a, b) =>
          ARABIC_ALPHABETS.indexOf(a as (typeof ARABIC_ALPHABETS)[number]) -
          ARABIC_ALPHABETS.indexOf(b as (typeof ARABIC_ALPHABETS)[number])
      );

    const defaultHasSymbols = defaultAvailableLettersRaw.includes("#");

    const defaultAlphabetLinks =
      language === "ar"
        ? [
            ...defaultArabicLetters,
            ...defaultEnglishLetters,
            ...(defaultHasSymbols ? ["#"] : []),
          ]
        : [
            ...defaultEnglishLetters,
            ...defaultArabicLetters,
            ...(defaultHasSymbols ? ["#"] : []),
          ];

    // Use sorted alphabet links for available letters to maintain proper order
    const defaultAvailableLetters = defaultAlphabetLinks;

    return {
      categoryAlphabetLinksMap,
      categoryAvailableLettersMap,
      categoryBrandsMap,
      defaultAlphabetLinks,
      defaultAvailableLetters,
      defaultGroupedBrands,
      navigationItems: pageLandingResult.value.siteNavigation?.items || [],
    };
  }
);
