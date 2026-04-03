import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";

import type { BannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";

export function setBannerClickOrigin({
  bannerColumn,
  bannerInnerPosition,
  bannerOrigin,
  bannerRow,
  extra,
}: BannerTrackingData) {
  if (
    bannerOrigin !== "lp" ||
    bannerRow === undefined ||
    bannerColumn === undefined
  ) {
    return;
  }

  clickOriginTrackingManager.setClickOrigin({
    column: bannerColumn,
    extra,
    inner_position: bannerInnerPosition,
    origin: "lp",
    row: bannerRow,
  });
}
