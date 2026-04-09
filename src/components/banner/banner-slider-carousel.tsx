import type { ComponentProps } from "react";

import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import {
  BannerScrollSnapCarousel,
  ScrollSnapCarouselItem,
} from "@/components/ui/banner-scroll-snap-carousel";
import { Link } from "@/i18n/navigation";
import { BannerSliderItem } from "@/lib/models/banner-slider";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

const BANNER_SLIDE_GAP_PX = 10;

export const BannerSliderCarousel = ({
  bannerColumn,
  bannerContainerProps,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  banners,
  carouselContainerProps,
  carouselItemProps,
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
}) => {
  return (
    <BannerScrollSnapCarousel
      autoPlay={carouselContainerProps?.carouselProps?.autoPlay}
      className={cn("w-full", carouselContainerProps?.carouselProps?.className)}
      contentProps={{
        ...carouselContainerProps?.contentProps,
        className: cn(
          "ms-0 gap-2.5",
          carouselContainerProps?.contentProps?.className
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
          carouselContainerProps?.nextButtonProps?.className
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
          carouselContainerProps?.previousButtonProps?.className
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
              bannerContainerProps?.className
            )}
            elementId={banner.elementId}
            href={banner.btnUrl}
          >
            <ContentfulImage
              alt={`Banner slider ${index}`}
              className="object-cover"
              decoding={index === 0 ? "sync" : "async"}
              fetchPriority={index === 0 ? "high" : undefined}
              fill
              loading={index === 0 ? "eager" : "lazy"}
              placeholder={index === 0 ? "empty" : getShimmerPlaceholder()}
              sizes="(max-width: 1200px) calc(100vw - 20px), 1200px"
              src={banner.image.desktop.url}
            />
          </BannerTrackerLink>
        </ScrollSnapCarouselItem>
      ))}
    </BannerScrollSnapCarousel>
  );
};
