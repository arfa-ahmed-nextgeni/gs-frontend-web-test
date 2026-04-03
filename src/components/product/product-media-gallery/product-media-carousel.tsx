"use client";

import { RefObject } from "react";

import Image from "next/image";

import { VideoPlayerDialog } from "@/components/dialogs/video-player-dialog";
import { CarouselContainer } from "@/components/ui/carousel/carousel-container";
import { CarouselItem } from "@/components/ui/carousel/carousel-item";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ProductMedia } from "@/lib/models/product-details-model";
import { CarouselHandle } from "@/lib/types/ui-types";
import { getShimmerPlaceholder } from "@/lib/utils/image";
import {
  getVimeoEmbedUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from "@/lib/utils/video";

export const ProductMediaCarousel = ({
  apiRef,
  items,
  onIndexChangeAction,
}: {
  apiRef: RefObject<CarouselHandle | null>;
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
        const youtubeUrl = isVideo ? getYouTubeEmbedUrl(media.url) : null;
        const vimeoUrl = isVideo ? getVimeoEmbedUrl(media.url) : null;
        const videoUrl = youtubeUrl || vimeoUrl;
        const videoThumbnail = getYouTubeThumbnail(media.url);

        return (
          <CarouselItem
            className="basis-1/1 group relative ps-0"
            key={media.url}
            tabIndex={0}
          >
            {isVideo && videoUrl ? (
              isMobile ? (
                <VideoPlayerDialog
                  videoThumbnail={videoThumbnail}
                  videoUrl={videoUrl}
                />
              ) : (
                <div className="relative size-full">
                  <iframe
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                    src={videoUrl}
                    title="Product video"
                  />
                </div>
              )
            ) : (
              <Image
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
