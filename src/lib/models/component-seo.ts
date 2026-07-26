import type { ComponentSeoData } from "@/lib/types/contentful/page-landing";

export class ComponentSeo {
  public canonicalUrl?: string;
  public metaKeywords?: string;
  public nofollow: boolean;
  public noindex: boolean;
  public pageDescription?: string;
  public pageTitle?: string;
  public shareImageUrls: string[];

  constructor(data: ComponentSeoData) {
    this.canonicalUrl = data.canonicalUrl;
    this.metaKeywords = data.metaKeywords?.trim() || undefined;
    this.nofollow = data.nofollow ?? false;
    this.noindex = data.noindex ?? false;
    this.pageDescription = data.pageDescription;
    this.pageTitle = data.pageTitle;
    this.shareImageUrls = getShareImageUrls(data.shareImages);
  }
}

function getShareImageUrls(
  shareImages?: ComponentSeoData["shareImages"]
): string[] {
  if (!Array.isArray(shareImages)) return [];
  return shareImages
    .map((asset) => asset?.fields?.file?.url)
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}
