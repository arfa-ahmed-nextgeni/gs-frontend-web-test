"use client";

import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import { getShimmerPlaceholder } from "@/lib/utils/image";

interface HomeCategoryLinkProps {
  imageUrl: string;
  label: string;
  lpColumn?: number;
  lpRow?: number;
  url: string;
}

export function HomeCategoryLink({
  imageUrl,
  label,
  lpColumn,
  lpRow,
  url,
}: HomeCategoryLinkProps) {
  const handleClick = () => {
    // Track LP click origin if row and column are available (landing page/home page)
    if (lpRow !== undefined && lpColumn !== undefined) {
      clickOriginTrackingManager.setClickOrigin({
        column: lpColumn,
        extra: {
          type: "desktop-categories",
        },
        origin: "lp",
        row: lpRow,
      });
    }
  };

  return (
    <Link
      className="flex flex-col items-center"
      href={url}
      onClick={handleClick}
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-black">
        <ContentfulImage
          alt=""
          aria-hidden="true"
          height={91}
          placeholder={getShimmerPlaceholder()}
          src={imageUrl}
          style={{ objectFit: "contain" }}
          width={91}
        />
      </div>
      <span className="mt-2 text-center text-xs text-[#374957]">{label}</span>
    </Link>
  );
}
