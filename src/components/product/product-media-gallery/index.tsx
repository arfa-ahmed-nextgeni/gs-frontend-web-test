"use client";

import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { ProductMediaCarousel } from "@/components/product/product-media-gallery/product-media-carousel";
import { ProductMediaOverlay } from "@/components/product/product-media-gallery/product-media-overlay";
import { ProductMediaThumbnailsSkeleton } from "@/components/product/product-media-gallery/product-media-thumbnails-skeleton";
import { useProductDetails } from "@/contexts/product-details-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ProductType } from "@/lib/constants/product/product-details";
import { CarouselHandle } from "@/lib/types/ui-types";

const ProductMediaThumbnails = dynamic(
  () =>
    import("@/components/product/product-media-gallery/product-media-thumbnails").then(
      (mod) => mod.ProductMediaThumbnails
    ),
  {
    loading: () => <ProductMediaThumbnailsSkeleton />,
  }
);

export const ProductMediaGallery = () => {
  const { product, selectedProduct } = useProductDetails();
  const isMobile = useIsMobile();

  const carouselApiRef = useRef<CarouselHandle>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldRenderDesktopThumbnails, setShouldRenderDesktopThumbnails] =
    useState(false);

  useEffect(() => {
    carouselApiRef.current?.scrollTo?.(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    setShouldRenderDesktopThumbnails(!isMobile);
  }, [isMobile]);

  const galleryItems =
    selectedProduct.mediaGallery.length > 0
      ? selectedProduct.mediaGallery
      : product.mediaGallery;

  useEffect(() => {
    if (currentIndex >= galleryItems.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, galleryItems.length]);

  return (
    <div className="col-span-6 grid aspect-square grid-cols-6 gap-2.5 lg:col-span-7 lg:aspect-auto lg:grid-cols-7">
      {shouldRenderDesktopThumbnails ? (
        <ProductMediaThumbnails
          currentIndex={currentIndex}
          items={galleryItems}
          onSelect={(index) => setCurrentIndex(index)}
        />
      ) : (
        <ProductMediaThumbnailsSkeleton />
      )}
      <div className="bg-bg-default relative col-span-6 overflow-hidden lg:rounded-xl">
        <ProductMediaCarousel
          apiRef={carouselApiRef}
          currentIndex={currentIndex}
          items={galleryItems}
          onIndexChangeAction={setCurrentIndex}
        />
        {product.type !== ProductType.GiftCard && <ProductMediaOverlay />}
      </div>
    </div>
  );
};
