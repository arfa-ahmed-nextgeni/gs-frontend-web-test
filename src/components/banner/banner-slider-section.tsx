import type { ComponentProps } from "react";

import { BannerSliderCarousel } from "@/components/banner/banner-slider-carousel";
import { BannerSliderCarouselSkeleton } from "@/components/banner/banner-slider-carousel-skeleton";
import { AsyncBoundary } from "@/components/common/async-boundary";

export const BannerSliderSection = (
  props: ComponentProps<typeof BannerSliderCarousel>
) => {
  if (props.isLcpCandidate) {
    return <BannerSliderCarousel {...props} />;
  }

  return (
    <AsyncBoundary
      fallback={
        <BannerSliderCarouselSkeleton {...props.bannerContainerProps} />
      }
    >
      <BannerSliderCarousel {...props} />
    </AsyncBoundary>
  );
};
