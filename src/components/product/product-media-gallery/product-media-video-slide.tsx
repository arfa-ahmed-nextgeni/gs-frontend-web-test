"use client";

import { useEffect, useState } from "react";

import { PlayCircle } from "lucide-react";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { getShimmerPlaceholder } from "@/lib/utils/image";
import {
  getVimeoEmbedUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
} from "@/lib/utils/video";

import type { ProductMedia } from "@/lib/models/product-details-model";

type ProductMediaVideoSlideProps = {
  isActive: boolean;
  media: ProductMedia;
};

export function ProductMediaVideoSlide({
  isActive,
  media,
}: ProductMediaVideoSlideProps) {
  const [shouldRenderPlayer, setShouldRenderPlayer] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShouldRenderPlayer(false);
    }
  }, [isActive]);

  const embedUrl =
    getYouTubeEmbedUrl(media.url, true) ?? getVimeoEmbedUrl(media.url, true);
  const posterUrl = media.preview || getYouTubeThumbnail(media.url);

  if (!embedUrl) {
    return (
      <div className="bg-bg-default relative size-full">
        {posterUrl && (
          <ProductImageWithFallback
            alt="Product video thumbnail"
            className="object-contain"
            decoding="async"
            fill
            placeholder={getShimmerPlaceholder()}
            sizes="(max-width: 1024px) 100vw, 78vw"
            src={posterUrl}
          />
        )}
      </div>
    );
  }

  return shouldRenderPlayer ? (
    <div className="relative size-full">
      <iframe
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 size-full"
        loading="lazy"
        src={embedUrl}
        title="Product video"
      />
    </div>
  ) : (
    <button
      className="group relative size-full"
      onClick={() => setShouldRenderPlayer(true)}
      type="button"
    >
      {posterUrl && (
        <ProductImageWithFallback
          alt="Product video thumbnail"
          className="object-contain"
          decoding="async"
          fill
          placeholder={getShimmerPlaceholder()}
          sizes="(max-width: 1024px) 100vw, 78vw"
          src={posterUrl}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
        <PlayCircle className="size-16 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
      </div>
    </button>
  );
}
