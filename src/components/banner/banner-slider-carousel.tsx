import type { ComponentProps } from "react";

import { getImageProps } from "next/image";

import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import {
  BannerScrollSnapCarousel,
  ScrollSnapCarouselItem,
} from "@/components/ui/banner-scroll-snap-carousel";
import { Link } from "@/i18n/navigation";
import { BannerSliderItem } from "@/lib/models/banner-slider";
import { cn } from "@/lib/utils";
import { contentfulImageLoader } from "@/lib/utils/contentful-image-loader";
import { getShimmerPlaceholder, isSvgSrc } from "@/lib/utils/image";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";
import type { ContentViewport } from "@/lib/utils/display-on";

const BANNER_SLIDE_GAP_PX = 10;
const BANNER_SLIDER_IMAGE_SIZES =
  "(max-width: 1200px) calc(100vw - 20px), 1200px";
const VIEWPORT_MEDIA = {
  desktop: "(min-width: 64rem)",
  mobile: "(width < 64rem)",
} satisfies Record<ContentViewport, string>;

function ViewportLcpBannerImage({
  alt,
  displayOn,
  src,
}: {
  alt: string;
  displayOn: ContentViewport;
  src: string;
}) {
  const {
    props: { src: fallbackSrc, srcSet, ...imageProps },
  } = getImageProps({
    alt,
    className: "object-cover",
    decoding: "sync",
    fetchPriority: "high",
    fill: true,
    loader: contentfulImageLoader,
    loading: "eager",
    sizes: BANNER_SLIDER_IMAGE_SIZES,
    src,
    unoptimized: isSvgSrc(src),
  });

  return (
    <picture>
      <source
        media={VIEWPORT_MEDIA[displayOn]}
        sizes={imageProps.sizes}
        srcSet={srcSet || fallbackSrc}
      />
      <img {...imageProps} alt={imageProps.alt} />
    </picture>
  );
}

export const BannerSliderCarousel = ({
  bannerColumn,
  bannerContainerProps,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  banners,
  carouselContainerProps,
  carouselItemProps,
  displayOn = "all",
  isLcpCandidate = false,
}: {
  bannerColumn?: number;
  bannerContainerProps?: Omit<ComponentProps<typeof Link>, "href">;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  banners: BannerSliderItem[];
  carouselContainerProps?: {
    carouselProps?: Pick<
      ComponentProps<typeof BannerScrollSnapCarousel>,
      "autoPlay" | "className"
    >;
    contentProps?: ComponentProps<
      typeof BannerScrollSnapCarousel
    >["contentProps"];
    dotsProps?: ComponentProps<typeof BannerScrollSnapCarousel>["dotsProps"];
    nextButtonProps?: ComponentProps<
      typeof BannerScrollSnapCarousel
    >["nextButtonProps"];
    nextIconProps?: ComponentProps<
      typeof BannerScrollSnapCarousel
    >["nextIconProps"];
    previousButtonProps?: ComponentProps<
      typeof BannerScrollSnapCarousel
    >["previousButtonProps"];
    previousIconProps?: ComponentProps<
      typeof BannerScrollSnapCarousel
    >["previousIconProps"];
  };
  carouselItemProps?: ComponentProps<typeof ScrollSnapCarouselItem>;
  displayOn?: ContentDisplayOn;
  isLcpCandidate?: boolean;
}) => {
  return (
    <BannerScrollSnapCarousel
      autoPlay={carouselContainerProps?.carouselProps?.autoPlay}
      className={cn("w-full", carouselContainerProps?.carouselProps?.className)}
      contentProps={{
        ...carouselContainerProps?.contentProps,
        className: cn(
          "ms-0 gap-2.5",
          carouselContainerProps?.contentProps?.className,
        ),
      }}
      dotsProps={{
        ...carouselContainerProps?.dotsProps,
        visible: carouselContainerProps?.dotsProps?.visible ?? true,
      }}
      nextButtonProps={{
        ...carouselContainerProps?.nextButtonProps,
        className: cn(
          "end-10",
          carouselContainerProps?.nextButtonProps?.className,
        ),
      }}
      nextIconProps={{
        ...carouselContainerProps?.nextIconProps,
        fill: carouselContainerProps?.nextIconProps?.fill ?? "#ffffff",
      }}
      previousButtonProps={{
        ...carouselContainerProps?.previousButtonProps,
        className: cn(
          "start-10",
          carouselContainerProps?.previousButtonProps?.className,
        ),
      }}
      previousIconProps={{
        ...carouselContainerProps?.previousIconProps,
        fill: carouselContainerProps?.previousIconProps?.fill ?? "#ffffff",
      }}
      slideGapPx={BANNER_SLIDE_GAP_PX}
    >
      {banners.map((banner, index) => (
        <ScrollSnapCarouselItem
          {...carouselItemProps}
          className={cn("basis-1/1 ps-0", carouselItemProps?.className)}
          key={`${banner.elementId || banner.id}`}
        >
          <BannerTrackerLink
            {...bannerContainerProps}
            bannerColumn={bannerColumn}
            bannerInnerPosition={index + 1}
            bannerLpId={bannerLpId}
            bannerOrigin={bannerOrigin}
            bannerRow={bannerRow}
            bannerStyle="horizontal"
            bannerType="banner-slider"
            className={cn(
              "relative flex w-full items-center",
              bannerContainerProps?.className,
            )}
            elementId={banner.elementId}
            href={banner.btnUrl}
          >
            {index === 0 && isLcpCandidate && displayOn !== "all" ? (
              <ViewportLcpBannerImage
                alt={`Banner slider ${index}`}
                displayOn={displayOn}
                src={banner.image.desktop.url}
              />
            ) : (
              <ContentfulImage
                alt={`Banner slider ${index}`}
                className="object-cover"
                decoding={index === 0 && isLcpCandidate ? "sync" : "async"}
                fetchPriority={
                  index === 0 && isLcpCandidate ? "high" : undefined
                }
                fill
                loading={index === 0 && isLcpCandidate ? "eager" : "lazy"}
                placeholder={
                  index === 0 && isLcpCandidate
                    ? "empty"
                    : getShimmerPlaceholder()
                }
                sizes={BANNER_SLIDER_IMAGE_SIZES}
                src={banner.image.desktop.url}
              />
            )}
          </BannerTrackerLink>
        </ScrollSnapCarouselItem>
      ))}
    </BannerScrollSnapCarousel>
  );
};
