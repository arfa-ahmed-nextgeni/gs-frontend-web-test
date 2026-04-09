import React from "react";

import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { WebsiteBanner } from "@/lib/models/website-banner";
import { getShimmerPlaceholder } from "@/lib/utils/image";

function cssSpacing(spacing?: number | Record<string, any> | string) {
  if (!spacing) return undefined;
  if (typeof spacing === "string" || typeof spacing === "number")
    return spacing;
  return Object.values(spacing)
    .map((v) => (typeof v === "number" ? `${v}px` : v))
    .join(" ");
}

export const WebsiteBannerComponent = ({
  banner,
  bannerColumn,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  isLcpCandidate = false,
}: {
  banner: WebsiteBanner;
  bannerColumn?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  isLcpCandidate?: boolean;
}) => {
  if (!banner) return null;

  const hasResponsiveImageVariants = Boolean(
    banner.desktopImageUrl && banner.mobileImageUrl
  );

  return (
    <div
      style={{
        margin: cssSpacing(banner.margin),
        padding: cssSpacing(banner.padding),
      }}
    >
      {banner.desktopImageUrl && (
        <div className="hidden sm:block">
          <BannerTrackerLink
            bannerColumn={bannerColumn}
            bannerInnerPosition={1}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="horizontal"
            bannerType="banner"
            elementId={banner.elementId}
            href={banner.url}
          >
            <ContentfulImage
              alt={banner.internalName || "Website Banner"}
              className="aspect-[var(--banner-width)/var(--banner-height)] rounded-lg"
              decoding={isLcpCandidate ? "sync" : "async"}
              fetchPriority={isLcpCandidate ? "high" : undefined}
              height={banner.height || 300}
              loading={
                isLcpCandidate && !hasResponsiveImageVariants
                  ? "eager"
                  : undefined
              }
              placeholder={isLcpCandidate ? "empty" : getShimmerPlaceholder()}
              src={banner.desktopImageUrl}
              style={
                {
                  "--banner-height": banner.height || 300,
                  "--banner-width": banner.width || 600,
                  height: banner.height,
                  width: banner.width,
                } as React.CSSProperties
              }
              width={banner.width || 600}
            />
          </BannerTrackerLink>
        </div>
      )}
      {banner.mobileImageUrl && (
        <div className="block sm:hidden">
          <BannerTrackerLink
            bannerColumn={bannerColumn}
            bannerInnerPosition={1}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="horizontal"
            bannerType="banner"
            className="flex justify-center"
            elementId={banner.elementId}
            href={banner.url}
          >
            <ContentfulImage
              alt={banner.internalName || "Website Banner"}
              className="aspect-[var(--banner-width)/var(--banner-height)] rounded-2xl"
              decoding={isLcpCandidate ? "sync" : "async"}
              fetchPriority={isLcpCandidate ? "high" : undefined}
              height={banner.mobileImageHeight || 200}
              loading={
                isLcpCandidate && !hasResponsiveImageVariants
                  ? "eager"
                  : undefined
              }
              placeholder={isLcpCandidate ? "empty" : getShimmerPlaceholder()}
              src={banner.mobileImageUrl}
              style={
                {
                  "--banner-height": banner.mobileImageHeight || 200,
                  "--banner-width": banner.mobileImageWidth || 400,
                  height: banner.mobileImageHeight,
                  width: banner.mobileImageWidth,
                } as React.CSSProperties
              }
              width={banner.mobileImageWidth || 400}
            />
          </BannerTrackerLink>
        </div>
      )}
    </div>
  );
};
