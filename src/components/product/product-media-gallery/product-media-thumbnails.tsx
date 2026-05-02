"use client";

import { useEffect, useState } from "react";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductMedia } from "@/lib/models/product-details-model";
import { cn } from "@/lib/utils";
import { getVimeoThumbnail, getYouTubeThumbnail } from "@/lib/utils/video";

export const ProductMediaThumbnails = ({
  currentIndex,
  items,
  onSelect,
}: {
  currentIndex: number;
  items: ProductMedia[];
  onSelect: (index: number) => void;
}) => {
  const [thumbnails, setThumbnails] = useState<(null | string)[]>([]);

  useEffect(() => {
    async function loadThumbnails() {
      const results = await Promise.all(
        items.map(async (media) => {
          if (media.type === "video") {
            if (media.url.includes("vimeo.com")) {
              return await getVimeoThumbnail(media.url);
            }
            if (
              media.url.includes("youtube.com") ||
              media.url.includes("youtu.be")
            ) {
              return getYouTubeThumbnail(media.url);
            }
          }

          return media.type === "image" ? media.url : media.preview || null;
        })
      );
      setThumbnails(results);
    }

    loadThumbnails();
  }, [items]);

  return (
    <ScrollArea
      className="col-span-0 lg:h-148.75 hidden lg:col-span-1 lg:block"
      type="hover"
    >
      <div className="flex flex-col gap-2.5">
        {items.map((media, index) => {
          const imageUrl = thumbnails[index];

          return (
            <button
              className={cn(
                "bg-bg-default transition-default border-border-light-gray relative aspect-square overflow-hidden rounded-xl border",
                { "border-border-base": index !== currentIndex }
              )}
              key={index}
              onClick={() => onSelect(index)}
            >
              {imageUrl && (
                <ProductImageWithFallback
                  alt="Product thumbnail"
                  className={cn({
                    "transition-default opacity-50": index !== currentIndex,
                  })}
                  fill
                  sizes="91px"
                  src={imageUrl}
                />
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
