import type { ComponentProps } from "react";

import { serializeBannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";
import { Link } from "@/i18n/navigation";
import { BANNER_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

/**
 * Banner Tracker Anchor Component
 * Server-first anchor that serializes banner tracking metadata onto the DOM.
 */
export function BannerTrackerAnchor({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  children,
  elementId,
  extra,
  ...anchorProps
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  children: React.ReactNode;
  elementId?: string;
  extra?: Record<string, unknown>;
} & ComponentProps<"a">) {
  const serializedBannerTrackingData = serializeBannerTrackingData({
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

  return (
    <a
      {...anchorProps}
      {...(serializedBannerTrackingData
        ? {
            [BANNER_TRACKING_DATA_ATTRIBUTE]: serializedBannerTrackingData,
          }
        : {})}
    >
      {children}
    </a>
  );
}

/**
 * Banner Tracker Link Component
 * Server-first Link that serializes banner tracking metadata onto the DOM.
 */
export function BannerTrackerLink({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  children,
  elementId,
  extra,
  ...linkProps
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  children: React.ReactNode;
  elementId?: string;
  extra?: Record<string, unknown>;
} & ComponentProps<typeof Link>) {
  const serializedBannerTrackingData = serializeBannerTrackingData({
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

  return (
    <Link
      {...linkProps}
      {...(serializedBannerTrackingData
        ? {
            [BANNER_TRACKING_DATA_ATTRIBUTE]: serializedBannerTrackingData,
          }
        : {})}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
