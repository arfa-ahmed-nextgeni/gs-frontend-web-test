"use client";

import { useEffect, useRef, useState } from "react";

import { ProductMediaCarousel } from "@/components/product/product-media-gallery/product-media-carousel";
import { ProductMediaOverlay } from "@/components/product/product-media-gallery/product-media-overlay";
import { ProductMediaThumbnails } from "@/components/product/product-media-gallery/product-media-thumbnails";
import { useProductDetails } from "@/contexts/product-details-context";
import { ProductType } from "@/lib/constants/product/product-details";
import { CarouselHandle } from "@/lib/types/ui-types";

export const ProductMediaGallery = () => {
  const { product, selectedProduct } = useProductDetails();

  const carouselApiRef = useRef<CarouselHandle>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    carouselApiRef.current?.scrollTo?.(currentIndex);
  }, [currentIndex]);

  const galleryItems = selectedProduct.mediaGallery;

  return (
    <div className="col-span-6 grid aspect-square grid-cols-6 gap-2.5 lg:col-span-7 lg:aspect-auto lg:grid-cols-7">
      <ProductMediaThumbnails
        currentIndex={currentIndex}
        items={galleryItems}
        onSelect={(index) => setCurrentIndex(index)}
      />
      <div className="bg-bg-default relative col-span-6 overflow-hidden lg:rounded-xl">
        <ProductMediaCarousel
          apiRef={carouselApiRef}
          items={galleryItems}
          onIndexChangeAction={setCurrentIndex}
        />
        {product.type !== ProductType.GiftCard && <ProductMediaOverlay />}
      </div>
    </div>
  );
};
