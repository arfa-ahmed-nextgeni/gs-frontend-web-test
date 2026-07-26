"use client";

import { useMemo } from "react";

import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/constants/search";

import type { CatalogServiceBrand } from "@/lib/actions/category/get-catalog-service-brands";

export interface BrandSearchResult {
  name: string;
  urlPath: string;
}

const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents: é → e
    .replace(/[\s.\-_']/g, "") // strip spaces, dots, dashes: "M.A.C" → "mac", "m a c" → "mac"
    .trim();

/**
 * Levenshtein edit distance between two strings
 */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}

/**
 * Match strategy:
 * 1. Substring match — brand contains the full query (e.g. "chanel" in "lesexclusifdechanel")
 * 2. Typo tolerance — edit distance ≤ 1 for short queries, ≤ 2 for longer ones
 *    compared against each word of the brand name
 */
function matchesBrand(
  normalizedQuery: string,
  normalizedBrand: string
): boolean {
  if (normalizedBrand.startsWith(normalizedQuery)) return true;
  const maxDistance = normalizedQuery.length >= 6 ? 2 : 1;
  if (editDistance(normalizedQuery, normalizedBrand) <= maxDistance)
    return true;

  return false;
}

const MAX_BRAND_RESULTS = 6;

export function useBrandFuzzySearch(
  brands: CatalogServiceBrand[],
  query: string
): BrandSearchResult[] {
  return useMemo(() => {
    const trimmed = query.trim();

    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) return [];

    const normalizedQuery = normalize(trimmed);

    if (normalizedQuery.length < 2) return [];

    return brands
      .filter((brand) => matchesBrand(normalizedQuery, normalize(brand.name)))
      .slice(0, MAX_BRAND_RESULTS)
      .map((brand) => ({
        name: brand.name,
        urlPath: brand.urlPath,
      }));
  }, [brands, query]);
}
