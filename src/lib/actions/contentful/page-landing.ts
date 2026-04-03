import "server-only";

import { cache } from "react";

import { cacheTag } from "next/cache";

import { contentfulClient } from "@/lib/clients/contentful";
import { CacheTags } from "@/lib/constants/cache/tags";
import { PageLandingSlug } from "@/lib/constants/contentful";
import { PageLanding } from "@/lib/models/page-landing";
import { PageLandingData } from "@/lib/types/contentful/page-landing";
import { getLocaleInfo } from "@/lib/utils/locale";

/**
 * Map app language to Contentful locale for localized SEO and content.
 * App locales are region-specific (e.g. en-AE, ar-SA), while Contentful in this space
 * uses "en-US" for English and "ar" for Arabic.
 */
function toContentfulLocale(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (normalized === "ar") return "ar";
  return "en-US";
}

export const getPageLandingData = ({
  locale,
  slug = PageLandingSlug.Desktop,
}: {
  locale: string;
  slug?: string;
}) => getPageLandingDataCached(locale, slug);

const getPageLandingDataCached = cache(async (locale: string, slug: string) => {
  "use cache";
  cacheTag(CacheTags.Contentful);

  const { language, region } = getLocaleInfo(locale);
  const contentfulLocale = toContentfulLocale(language);

  try {
    const entries = await contentfulClient.getEntries({
      content_type: "pageLanding",
      "fields.countryCode": region,
      "fields.slug": slug,
      include: 10,
      locale: contentfulLocale,
    });

    if (entries.items && entries.items.length > 0) {
      const firstItem = entries.items[0];
      const fields = firstItem.fields || {};

      // Try to resolve SEO from includes if it's missing
      if (!fields.seo && entries.includes?.Entry) {
        const seoComponents = entries.includes.Entry.filter(
          (entry: any) => entry?.sys?.contentType?.sys?.id === "componentSeo"
        );

        if (seoComponents.length === 1) {
          const seoComponent = seoComponents[0];
          if (!firstItem.fields) {
            firstItem.fields = {};
          }
          firstItem.fields.seo = seoComponent;
          fields.seo = seoComponent;
        }
      }

      // Check if SEO is a Link reference that needs resolving
      const seoField = fields.seo as any;
      if (
        seoField &&
        seoField.fields === undefined &&
        seoField.sys &&
        seoField.sys.type === "Link"
      ) {
        const linkId = seoField.sys.id;
        const resolvedSeo = entries.includes?.Entry?.find(
          (entry: any) => entry?.sys?.id === linkId
        );

        if (resolvedSeo) {
          if (!firstItem.fields) {
            firstItem.fields = {};
          }
          firstItem.fields.seo = resolvedSeo;
          fields.seo = resolvedSeo;
        }
      }
    }

    return structuredClone(
      new PageLanding(entries as unknown as PageLandingData)
    );
  } catch (error) {
    console.error("Error getting page landing data", error);
    return {};
  }
});
