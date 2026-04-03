import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";

import type { SectionHeaderClickOriginProps } from "@/components/common/section-header/utils/section-header-click-origin-dataset";

export function setSectionHeaderClickOrigin({
  lpColumn,
  lpExtra,
  lpRow,
}: SectionHeaderClickOriginProps) {
  if (lpRow === undefined || lpColumn === undefined) {
    return;
  }

  clickOriginTrackingManager.setClickOrigin({
    column: lpColumn,
    extra: lpExtra,
    origin: "lp",
    row: lpRow,
  });
}
