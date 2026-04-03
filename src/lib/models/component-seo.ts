import type {
  ComponentSeoData,
  PageLandingData,
} from "@/lib/types/contentful/page-landing";

export interface ComponentSeo {
  canonicalUrl?: string;
  nofollow: boolean;
  noindex: boolean;
  pageDescription?: string;
  pageTitle?: string;
  shareImageUrls: string[];
}

const COMPONENT_SEO_CONTENT_TYPE_ID = "componentSeo";

type ResolvedSeoEntry = NonNullable<
  NonNullable<NonNullable<PageLandingData["items"]>[0]["fields"]>["seo"]
>;

export function parseComponentSeo(
  seo: ResolvedSeoEntry | undefined
): ComponentSeo | undefined {
  if (seo === undefined || !isResolvedSeoEntry(seo) || !seo.fields) {
    return undefined;
  }

  const data = seo.fields;

  return {
    canonicalUrl: data.canonicalUrl,
    nofollow: data.nofollow ?? false,
    noindex: data.noindex ?? false,
    pageDescription: data.pageDescription,
    pageTitle: data.pageTitle,
    shareImageUrls: getShareImageUrls(data.shareImages),
  };
}

function getShareImageUrls(
  shareImages?: ComponentSeoData["shareImages"]
): string[] {
  if (!Array.isArray(shareImages)) return [];
  return shareImages
    .map((asset) => asset?.fields?.file?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

function isResolvedSeoEntry(
  seo: ResolvedSeoEntry
): seo is { fields: ComponentSeoData } & ResolvedSeoEntry {
  return Boolean(
    seo?.fields &&
      seo?.sys?.contentType?.sys?.id === COMPONENT_SEO_CONTENT_TYPE_ID
  );
}
