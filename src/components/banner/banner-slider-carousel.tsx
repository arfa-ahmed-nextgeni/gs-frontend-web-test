import { ComponentProps, useId } from "react";

import { BannerTrackerLink } from "@/components/analytics/banner-tracker";
import { ContentfulImage } from "@/components/shared/contentful-image";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { Link } from "@/i18n/navigation";
import { BannerSliderItem } from "@/lib/models/banner-slider";
import { cn } from "@/lib/utils";
import { getShimmerPlaceholder } from "@/lib/utils/image";

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
  carouselContainerProps?: ComponentProps<typeof CarouselContainer>;
  carouselItemProps?: ComponentProps<typeof CarouselItem>;
}) => {
  const carouselIdPrefix = useId();

  return (
    <CarouselContainer
      {...carouselContainerProps}
      dotsProps={{
        idPrefix: carouselIdPrefix,
        visible: true,
      }}
      nextButtonProps={{
        className: "end-10",
      }}
      nextIconProps={{
        fill: "#ffffff",
      }}
      previousButtonProps={{
        className: "start-10",
      }}
      previousIconProps={{
        fill: "#ffffff",
      }}
    >
      {banners.map((banner, index) => (
        <CarouselItem
          {...carouselItemProps}
          className={cn("basis-1/1", carouselItemProps?.className)}
          id={`${carouselIdPrefix}-carousel-item-${index}`}
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
              placeholder={getShimmerPlaceholder()}
              preload={index === 0}
              sizes="(max-width: 1200px) 80vw, 1200px"
              src={banner.image.desktop.url}
            />
          </BannerTrackerLink>
        </CarouselItem>
      ))}
    </CarouselContainer>
  );
};
