import React from "react";

import { getImageProps } from "next/image";

import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { WebsiteBanner } from "@/lib/models/website-banner";
import {
  contentfulImageLoader,
  normalizeContentfulSrc,
} from "@/lib/utils/contentful-image-loader";
import { getDisplayOnClassName } from "@/lib/utils/display-on";
import { getShimmerPlaceholder, isSvgSrc } from "@/lib/utils/image";

function cssSpacing(spacing?: number | Record<string, any> | string) {
  if (!spacing) return undefined;
  if (typeof spacing === "string" || typeof spacing === "number")
    return spacing;
  return Object.values(spacing)
    .map((v) => (typeof v === "number" ? `${v}px` : v))
    .join(" ");
}

function getLcpBannerImageProps({
  alt,
  height,
  maxWidth,
  src,
  width,
}: {
  alt: string;
  height: number;
  maxWidth?: number;
  src: string;
  width: number;
}) {
  const normalizedSrc = normalizeContentfulSrc(src);

  return getImageProps({
    alt,
    decoding: "sync",
    fetchPriority: "high",
    height,
    loader: (loaderProps) =>
      contentfulImageLoader({ ...loaderProps, maxWidth }),
    loading: "eager",
    src: normalizedSrc,
    unoptimized: isSvgSrc(normalizedSrc),
    width,
  }).props;
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
    banner.desktopImageUrl && banner.mobileImageUrl,
  );
  const bannerAlt = banner.internalName || "Website Banner";
  const responsiveLcpImageProps =
    isLcpCandidate && banner.desktopImageUrl && banner.mobileImageUrl
      ? {
          desktop: getLcpBannerImageProps({
            alt: bannerAlt,
            height: banner.height || 300,
            maxWidth: (banner.width || 600) * 2,
            src: banner.desktopImageUrl,
            width: banner.width || 600,
          }),
          mobile: getLcpBannerImageProps({
            alt: bannerAlt,
            height: banner.mobileImageHeight || 200,
            src: banner.mobileImageUrl,
            width: banner.mobileImageWidth || 400,
          }),
        }
      : undefined;

  if (responsiveLcpImageProps) {
    const desktopImageHeight = banner.height || 300;
    const desktopImageWidth = banner.width || 600;
    const mobileImageHeight = banner.mobileImageHeight || 200;
    const mobileImageWidth = banner.mobileImageWidth || 400;
    const responsiveLcpFallbackProps =
      banner.displayOn === "all"
        ? responsiveLcpImageProps.mobile
        : {
            alt: bannerAlt,
            decoding: "sync" as const,
            fetchPriority: "high" as const,
            height:
              banner.displayOn === "desktop"
                ? desktopImageHeight
                : mobileImageHeight,
            loading: "eager" as const,
            width:
              banner.displayOn === "desktop"
                ? desktopImageWidth
                : mobileImageWidth,
          };

    return (
      <div
        className={getDisplayOnClassName(banner.displayOn)}
        style={{
          margin: cssSpacing(banner.margin),
          padding: cssSpacing(banner.padding),
        }}
      >
        <BannerTrackerLink
          bannerColumn={bannerColumn}
          bannerInnerPosition={1}
          bannerLpId={bannerLpId}
          bannerOrigin={bannerOrigin}
          bannerRow={bannerRow}
          bannerStyle="horizontal"
          bannerType="banner"
          className="flex justify-center lg:inline-flex"
          elementId={banner.elementId}
          href={banner.url}
        >
          <picture>
            {banner.displayOn !== "mobile" && (
              <source
                height={desktopImageHeight}
                media="(min-width: 64rem)"
                srcSet={
                  responsiveLcpImageProps.desktop.srcSet ||
                  responsiveLcpImageProps.desktop.src
                }
                width={desktopImageWidth}
              />
            )}
            {banner.displayOn === "mobile" && (
              <source
                height={mobileImageHeight}
                media="(width < 64rem)"
                srcSet={
                  responsiveLcpImageProps.mobile.srcSet ||
                  responsiveLcpImageProps.mobile.src
                }
                width={mobileImageWidth}
              />
            )}
            <img
              {...responsiveLcpFallbackProps}
              alt={responsiveLcpFallbackProps.alt}
              className="h-(--mobile-banner-height) w-(--mobile-banner-width) lg:h-(--desktop-banner-height) lg:w-(--desktop-banner-width) rounded-2xl lg:rounded-lg"
              style={
                {
                  "--desktop-banner-height": `${desktopImageHeight}px`,
                  "--desktop-banner-width": `${desktopImageWidth}px`,
                  "--mobile-banner-height": `${mobileImageHeight}px`,
                  "--mobile-banner-width": `${mobileImageWidth}px`,
                } as React.CSSProperties
              }
            />
          </picture>
        </BannerTrackerLink>
      </div>
    );
  }

  return (
    <div
      className={getDisplayOnClassName(banner.displayOn)}
      style={{
        margin: cssSpacing(banner.margin),
        padding: cssSpacing(banner.padding),
      }}
    >
      {banner.desktopImageUrl && (
        <div className="hidden lg:block">
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
              alt={bannerAlt}
              className="aspect-[var(--banner-width)/var(--banner-height)] rounded-lg"
              decoding={isLcpCandidate ? "sync" : "async"}
              fetchPriority={isLcpCandidate ? "high" : undefined}
              height={banner.height || 300}
              loading={
                isLcpCandidate && !hasResponsiveImageVariants
                  ? "eager"
                  : undefined
              }
              maxWidth={(banner.width || 600) * 2}
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
        <div className="block lg:hidden">
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
              alt={bannerAlt}
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
