import Image from "next/image";

import { useTranslations } from "next-intl";

import PlusIcon from "@/assets/icons/plus-icon.svg";
import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import { ProductDetailsOriginalProduct } from "@/components/product/product-details/product-details-original-product";
import { ProductShareButton } from "@/components/product/product-details/product-share-button";
import { ProductRating } from "@/components/product/product-rating";
import { ProductReviewWriteLink } from "@/components/product/product-reviews/product-review-write-link";
import { ProductType } from "@/lib/constants/product/product-details";
import { cn } from "@/lib/utils";

import type { ProductDetailsModel } from "@/lib/models/product-details-model";

export const ProductDetailsHeader = ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  const t = useTranslations("ProductPage.header");

  return (
    <>
      {product.type === ProductType.EGiftCard && (
        <p className="text-text-primary text-center text-xl font-medium lg:hidden">
          {product.name}
        </p>
      )}
      <div className="hidden flex-col lg:flex">
        {product.brand && (
          <div className="gap-1.25 flex flex-row items-center">
            <p className="text-text-secondary text-sm font-medium leading-none">
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
        )}
        <div className="mt-2 flex flex-row items-start gap-2.5">
          <h1
            className={cn(
              "text-text-primary lg:max-w-105 text-xl font-medium",
              {
                "lg:max-w-116": product.type === ProductType.EGiftCard,
              }
            )}
          >
            {product.name}
          </h1>
          <ProductShareButton />
        </div>
        {product.type && ![ProductType.EGiftCard].includes(product.type) && (
          <div className="mt-4 flex flex-row items-center gap-5">
            <ProductDetailsOriginalProduct />
            {!!product.averageRating && (
              <ProductRating rating={product.averageRating} />
            )}
            <p className="text-text-secondary text-[10px] font-medium leading-none">
              {t("reviews", { count: `${product.ratingCount || ""}` })}
            </p>
            <ProductReviewWriteLink
              loadingLinkProps={{
                className: "flex flex-row gap-0.5",
              }}
            >
              <Image
                alt=""
                className="size-2"
                height={8}
                src={PlusIcon}
                width={8}
              />
              <p className="text-text-secondary text-[10px] font-medium leading-none">
                {t("writeAReview")}
              </p>
            </ProductReviewWriteLink>
          </div>
        )}
      </div>
    </>
  );
};
