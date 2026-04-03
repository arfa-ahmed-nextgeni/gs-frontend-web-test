"use client";

import Image from "next/image";

import UpArrowIcon from "@/assets/icons/up-arrow-icon.svg";
import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import { ProductActionButtons } from "@/components/product/product-action-buttons";
import { ProductDetailsPrice } from "@/components/product/product-details/product-details-price";
import { useProductDetails } from "@/contexts/product-details-context";
import { ProductType } from "@/lib/constants/product/product-details";
import { cn } from "@/lib/utils";

export const StickyAddToCartDesktop = ({
  isVisible,
}: {
  isVisible: boolean;
}) => {
  const { product, selectedVariantIndex } = useProductDetails();

  if (product.type === ProductType.EGiftCard) {
    return null;
  }

  const galleryItem =
    product.variants[selectedVariantIndex]?.mediaGallery[0] ||
    product.mediaGallery[0];

  const productThumbnail =
    galleryItem?.type === "video" ? galleryItem.preview : galleryItem?.url;

  const scrollToTop = () => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  return (
    <>
      <button
        className={cn(
          "transition-default bg-btn-bg-primary size-12.5 fixed bottom-1/3 end-5 hidden items-center justify-center rounded-xl lg:flex",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={scrollToTop}
      >
        <Image
          alt="scroll top"
          className="size-5"
          height={20}
          src={UpArrowIcon}
          width={20}
        />
      </button>
      <div
        className={cn(
          "bg-bg-default border-border-base transition-default h-22.5 px-12.5 fixed inset-x-0 bottom-0 hidden flex-row items-center justify-between border-t lg:flex",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex flex-row items-center gap-5">
          <div className="border-border-base overflow-hidden rounded-xl border">
            {productThumbnail && (
              <Image
                alt="product image"
                className="size-17.5"
                height={70}
                src={productThumbnail}
                width={70}
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1">
              <p className="text-text-secondary line-clamp-1 text-sm font-medium">
                {product.brand}
              </p>
              <Image
                alt="Verified"
                className="size-2.5"
                height={10}
                src={VerifiedIcon}
                width={10}
              />
            </div>
            <p className="text-text-primary line-clamp-2 text-xl font-medium">
              {product.name}
            </p>
          </div>
        </div>

        <div className="gap-12.5 flex flex-row">
          <ProductDetailsPrice
            containerProps={{
              className: "hidden lg:flex",
            }}
          />
          <ProductActionButtons layout="sticky" />
        </div>
      </div>
    </>
  );
};
