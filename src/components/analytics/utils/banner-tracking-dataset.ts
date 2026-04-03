export type BannerTrackingData = {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  elementId: string;
  extra?: Record<string, unknown>;
};

export function parseBannerTrackingData(
  serializedBannerTrackingData: null | string
): BannerTrackingData | null {
  if (!serializedBannerTrackingData) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      serializedBannerTrackingData
    ) as BannerTrackingData | null;

    if (!parsed || typeof parsed !== "object" || !parsed.elementId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function serializeBannerTrackingData({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  elementId,
  extra,
}: Partial<BannerTrackingData>) {
  if (!elementId) {
    return undefined;
  }

  return JSON.stringify({
    bannerColumn,
    bannerInnerPosition,
    bannerLpId,
    bannerOrigin,
    bannerRow,
    bannerStyle,
    bannerType,
    elementId,
    extra,
  });
}
