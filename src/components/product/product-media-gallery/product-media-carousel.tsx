"use client";

import type { RefObject } from "react";

import { VideoPlayerDialog } from "@/components/dialogs/video-player-dialog";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductMediaVideoSlide } from "@/components/product/product-media-gallery/product-media-video-slide";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { getShimmerPlaceholder } from "@/lib/utils/image";
import { getYouTubeThumbnail } from "@/lib/utils/video";

import type { ProductMedia } from "@/lib/models/product-details-model";
import type { CarouselHandle } from "@/lib/types/ui-types";

export const ProductMediaCarousel = ({
  apiRef,
  currentIndex,
  items,
  onIndexChangeAction,
}: {
  apiRef: RefObject<CarouselHandle | null>;
  currentIndex: number;
  items: ProductMedia[];
  onIndexChangeAction: (index: number) => void;
}) => {
  const isMobile = useIsMobile();

  return (
    <CarouselContainer
      carouselProps={{
        apiRef,
        className: "size-full",
        onIndexChange: onIndexChangeAction,
        opts: {
          ssr: items.map(() => 100),
        },
      }}
      contentProps={{
        className: "size-full ms-0",
        containerProps: {
          className: "size-full",
        },
      }}
      dotsProps={{
        className: "lg:hidden",
        dotClassName: "after:bg-bg-primary after:opacity-20",
        visible: true,
      }}
      nextButtonProps={{
        className: "lg:hidden",
      }}
      previousButtonProps={{
        className: "lg:hidden",
      }}
    >
      {items.map((media, index) => {
        const isVideo = media.type === "video";
        const videoThumbnail = media.preview || getYouTubeThumbnail(media.url);

        return (
          <CarouselItem
            className="basis-1/1 group relative ps-0"
            key={media.url}
            tabIndex={0}
          >
            {isVideo ? (
              isMobile ? (
                <VideoPlayerDialog
                  videoThumbnail={videoThumbnail}
                  videoUrl={media.url}
                />
              ) : (
                <ProductMediaVideoSlide
                  isActive={currentIndex === index}
                  media={media}
                />
              )
            ) : (
              <ProductImageWithFallback
                alt="Product image"
                className="transition-default object-contain group-focus-within:scale-105 group-hover:scale-105"
                decoding={index === 0 ? "sync" : "async"}
                fetchPriority={index === 0 ? "high" : undefined}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                placeholder={getShimmerPlaceholder()}
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 78vw"
                src={media.url}
              />
            )}
          </CarouselItem>
        );
      })}
    </CarouselContainer>
  );
};
