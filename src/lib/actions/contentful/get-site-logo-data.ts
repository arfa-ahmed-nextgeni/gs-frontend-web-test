import "server-only";

import { cache } from "react";

import { cacheLife, cacheTag } from "next/cache";

import { contentfulClient } from "@/lib/clients/contentful";
import { CacheTags } from "@/lib/constants/cache/tags";

import type { SiteLogoData } from "@/lib/types/contentful/site-logo";

function toContentfulLocale(language: string): string {
  return language.trim().toLowerCase() === "ar" ? "ar" : "en-US";
}

export const getSiteLogoData = ({ locale }: { locale: string }) =>
  getSiteLogoDataCached(locale);

const getSiteLogoDataCached = cache(async (locale: string) => {
  "use cache";
  cacheLife("max");
  cacheTag(CacheTags.Contentful);

  const language = locale.split("-")[0];
  const contentfulLocale = toContentfulLocale(language);

  try {
    const entries = await contentfulClient.getEntries({
      content_type: "siteLogo",
      include: 1,
      limit: 1,
      locale: contentfulLocale,
    });

    if (!entries.items.length) return null;

    return entries.items[0] as unknown as SiteLogoData;
  } catch (error) {
    console.error("Error fetching site logo data", error);
    return null;
  }
});
