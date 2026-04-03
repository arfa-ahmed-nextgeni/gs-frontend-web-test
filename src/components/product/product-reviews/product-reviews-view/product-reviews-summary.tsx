import Image from "next/image";

import { getTranslations } from "next-intl/server";

import { ProductRating } from "@/components/product/product-rating";
import { getProductBasicInfo } from "@/lib/actions/products/get-product-basic-info";
import { isOk } from "@/lib/utils/service-result";

export const ProductReviewsSummary = async ({ urlKey }: { urlKey: string }) => {
  const productBasicInfoResponse = await getProductBasicInfo({
    urlKey,
  });

  const t = await getTranslations("ProductReviewsPage");

  if (isOk(productBasicInfoResponse)) {
    const product = productBasicInfoResponse.data;

    return (
      <div className="h-11.25 flex flex-row justify-between px-5">
        <div className="flex flex-1 flex-row gap-1.5">
          <div className="border-border-base bg-bg-default relative aspect-square h-full shrink-0 overflow-hidden rounded-xl border">
            {product.image && (
              <Image alt="product image" fill src={product.image} />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-text-primary line-clamp-1 text-xs font-semibold">
              {product.name}
            </p>
            <p className="text-text-primary line-clamp-2 text-xs font-normal">
              {product.description}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-row items-start justify-end gap-2.5">
          <p className="text-text-primary text-[50px] font-light leading-[45px]">
            {product.ratingSummary}
          </p>
          <div className="flex h-full flex-col justify-between">
            <ProductRating
              hideRating
              rating={product.ratingSummary}
              variant="large"
            />
            <p className="text-text-primary text-sm font-medium">
              {t("reviews", { count: `${product.reviewsCount || ""}` })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
