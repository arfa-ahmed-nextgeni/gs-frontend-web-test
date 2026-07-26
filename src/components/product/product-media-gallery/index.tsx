"use client";

import { memo, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { ProductMediaCarousel } from "@/components/product/product-media-gallery/product-media-carousel";
import { ProductMediaOverlay } from "@/components/product/product-media-gallery/product-media-overlay";
import { ProductMediaThumbnailsSkeleton } from "@/components/product/product-media-gallery/product-media-thumbnails-skeleton";
import { useProductDetails } from "@/contexts/product-details-context";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { ProductType } from "@/lib/constants/product/product-details";
import { CarouselHandle } from "@/lib/types/ui-types";

import type {
  ProductDetailsModel,
  ProductVariant,
} from "@/lib/models/product-details-model";

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
  return (
    <ProductMediaGalleryContent
      product={product}
      selectedProduct={selectedProduct}
    />
  );
};

const ProductMediaGalleryContent = memo(function ProductMediaGalleryContent({
  product,
  selectedProduct,
}: {
  product: ProductDetailsModel;
  selectedProduct: ProductVariant;
}) {
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
    <div className="col-span-6 grid grid-cols-6 gap-2.5 md:col-span-7 md:h-full md:min-h-0 lg:col-span-7 lg:grid-cols-7">
      {shouldRenderDesktopThumbnails ? (
        <ProductMediaThumbnails
          currentIndex={currentIndex}
          items={galleryItems}
          onSelect={(index) => setCurrentIndex(index)}
        />
      ) : (
        <ProductMediaThumbnailsSkeleton />
      )}
      <div className="bg-bg-default relative col-span-6 aspect-square min-h-0 overflow-hidden md:aspect-auto md:h-full md:rounded-xl lg:rounded-xl">
        <div className="top-11.5 absolute inset-x-0 bottom-0">
          {galleryItems.length > 0 ? (
            <ProductMediaCarousel
              apiRef={carouselApiRef}
              currentIndex={currentIndex}
              items={galleryItems}
              onIndexChangeAction={setCurrentIndex}
            />
          ) : (
            <ProductImageWithFallback
              alt="Product image"
              className="object-contain"
              fill
              sizes="(max-width: 1024px) 100vw, 78vw"
            />
          )}
        </div>
        {product.type !== ProductType.GiftCard && <ProductMediaOverlay />}
      </div>
    </div>
  );
});
