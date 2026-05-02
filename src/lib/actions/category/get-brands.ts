import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { graphqlRequest } from "@/lib/clients/graphql";
import { CATEGORIES_GRAPHQL_QUERIES } from "@/lib/constants/api/graphql/categories";
import { CacheTags } from "@/lib/constants/cache/tags";
import { ARABIC_ALPHABETS, Locale } from "@/lib/constants/i18n";
import { ArabicAlphabet, Brand, GroupedBrands } from "@/lib/types/brands";
import { getStoreCode } from "@/lib/utils/country";
import { containsArabic } from "@/lib/utils/name-formatting";
import { failure, ok } from "@/lib/utils/service-result";

/**
 * Maps Arabic letter variations to their base forms
 * This ensures that ا, أ, إ, آ all map to ا
 * Keys are sorted by Unicode value (U+0622 to U+064A)
 */
const arabicLetterVariations: Record<string, string> = {
  آ: "ا", // U+0622 - Alif with madda
  أ: "ا", // U+0623 - Alif with hamza above
  ؤ: "و", // U+0624 - Waw with hamza
  إ: "ا", // U+0625 - Alif with hamza below
  ئ: "ي", // U+0626 - Ya with hamza
  ا: "ا", // U+0627 - Alif (base form)
  ة: "ه", // U+0629 - Ta marbuta
  و: "و", // U+0648 - Waw (base form)
  ى: "ي", // U+0649 - Alif maksura
  ي: "ي", // U+064A - Ya (base form)
};

/**
 * Gets the first letter of a brand name for grouping
 * Returns uppercase English letter, normalized Arabic letter, or "#" for numbers/symbols
 */
export function getFirstLetter(name: string): string {
  if (!name || name.trim().length === 0) {
    return "#";
  }

  const firstChar = name.trim()[0];

  // Check if it's an English letter (A-Z or a-z)
  if (/[A-Za-z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }

  // Check if it's an Arabic letter
  if (containsArabic(firstChar)) {
    // Check if it's a known variation first
    if (arabicLetterVariations[firstChar]) {
      return arabicLetterVariations[firstChar];
    }

    // If it's already a base letter, return it
    if (ARABIC_ALPHABETS.includes(firstChar as ArabicAlphabet)) {
      return firstChar;
    }

    // Try to normalize by removing diacritics (handles combining marks)
    const normalized = firstChar
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670]/g, "");

    // Check if normalized character is a known variation
    if (arabicLetterVariations[normalized]) {
      return arabicLetterVariations[normalized];
    }

    // Check if normalized character is a base letter
    if (ARABIC_ALPHABETS.includes(normalized as ArabicAlphabet)) {
      return normalized;
    }

    // Check if the character contains any base letter (for combined forms)
    for (const baseLetter of ARABIC_ALPHABETS) {
      if (firstChar.includes(baseLetter) || normalized.includes(baseLetter)) {
        return baseLetter;
      }
    }

    // If we can't categorize it, return the normalized version
    // This ensures all Arabic text is still grouped
    return normalized || firstChar;
  }

  // For numbers and other symbols, return "#"
  return "#";
}

/**
 * Groups brands alphabetically by their first letter
 */
export function groupBrandsAlphabetically(brands: Brand[]): GroupedBrands {
  const grouped: GroupedBrands = {};

  for (const brand of brands) {
    const firstLetter = getFirstLetter(brand.name);

    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }

    grouped[firstLetter].push(brand);
  }

  // Sort brands within each group alphabetically
  for (const letter in grouped) {
    grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export const getBrands = ({ locale }: { locale: Locale }) =>
  getBrandsCached(locale);

const getBrandsCached = cache(async (locale: Locale) => {
  "use cache";
  cacheTag(CacheTags.Magento);

  try {
    const response = await graphqlRequest({
      query: CATEGORIES_GRAPHQL_QUERIES.GET_BRANDS,
      skipUserAgentHeader: true,
      storeCode: getStoreCode(locale),
    });

    if (!response.data?.categories?.items?.length) {
      return failure("Failed to get brands");
    }

    const brands: Brand[] =
      response.data.categories?.items?.[0]?.children?.map((child) => ({
        image: child?.image || "",
        name: child?.name || "",
        uid: child?.uid || "",
        urlKey: child?.url_key || "",
        urlPath: child?.url_path || "",
      })) || [];

    const groupedBrands = groupBrandsAlphabetically(brands);

    return ok(groupedBrands);
  } catch (error) {
    console.error("Failed to get brands:", error);
    return failure("Failed to get brands");
  }
});
