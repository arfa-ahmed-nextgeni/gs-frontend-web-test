import "server-only";

import { cache } from "react";

import { cacheLife, cacheTag } from "next/cache";

import { contentfulClient } from "@/lib/clients/contentful";
import { CacheTags } from "@/lib/constants/cache/tags";
import { getLocaleInfo } from "@/lib/utils/locale";

import type {
  CashbackDialogContent,
  PdpDialogConfig,
  PdpDialogConfigAssetData,
  PdpDialogConfigData,
} from "@/lib/types/contentful/pdp-dialog-config";

function toContentfulLocale(language: string): string {
  const normalized = language.trim().toLowerCase();

  if (normalized === "ar") {
    return "ar";
  }

  return "en-US";
}

export const getPdpDialogConfigData = ({ locale }: { locale: string }) =>
  getPdpDialogConfigDataCached(locale);

const getPdpDialogConfigDataCached = cache(async (locale: string) => {
  "use cache";
  cacheLife("max");
  cacheTag(CacheTags.Contentful);

  const { language, region } = getLocaleInfo(locale);
  const contentfulLocale = toContentfulLocale(language);

  try {
    const entries = await contentfulClient.getEntries({
      content_type: "pdpDialogConfig",
      "fields.countryCode": region,
      include: 10,
      limit: 1,
      locale: contentfulLocale,
    });

    const fields = (entries as unknown as PdpDialogConfigData).items?.[0]
      ?.fields;

    if (!fields) {
      return null;
    }

    const originalProduct =
      fields.originalProductDialogTitle && fields.originalProductDialogContent
        ? {
            content: fields.originalProductDialogContent,
            title: fields.originalProductDialogTitle,
          }
        : undefined;

    const cashback = mapCashbackDialogContent({
      asset: fields.cashbackDialogImage,
      title: fields.cashbackDialogTitle,
    });

    if (!originalProduct && !cashback) {
      return null;
    }

    return structuredClone<PdpDialogConfig>({
      cashback,
      originalProduct,
    });
  } catch {
    return null;
  }
});

function mapCashbackDialogContent({
  asset,
  title,
}: {
  asset?: PdpDialogConfigAssetData;
  title?: string;
}): CashbackDialogContent | undefined {
  const file = asset?.fields?.file;
  const imageUrl = file?.url;

  if (!imageUrl) {
    return undefined;
  }

  return {
    imageHeight: file.details?.image?.height,
    imageUrl,
    imageWidth: file.details?.image?.width,
    title: title || asset?.fields?.title,
  };
}
