import Image from "next/image";

import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { getProductBasicInfo } from "@/lib/actions/products/get-product-basic-info";
import { isOk } from "@/lib/utils/service-result";

export const ProductReviewProductInfo = async ({
  params,
}: {
  params: Promise<{
    urlKey: string;
  }>;
}) => {
  const { urlKey } = await params;
  const productBasicInfoResponse = await getProductBasicInfo({
    urlKey,
  });

  if (isOk(productBasicInfoResponse)) {
    const product = productBasicInfoResponse.data;

    return (
      <div className="h-25 bg-bg-default flex w-full shrink-0 flex-row gap-2.5 rounded-xl p-2.5">
        <div className="relative aspect-square h-full overflow-hidden rounded-xl">
          <Image alt="product image" fill src={product.image} />
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <p className="text-text-primary line-clamp-1 text-xs font-semibold">
            {product.name}
          </p>
          <p className="text-text-primary line-clamp-2 text-xs font-normal">
            {product.description}
          </p>
          {!productBasicInfoResponse.data.isConfigurable ? (
            <ProductCardPrice
              containerProps={{
                className: "px-0",
              }}
              oldPrice={product.oldPrice}
              price={product.price}
            />
          ) : (
            <div />
          )}
        </div>
        {/* <div className="pe-2.5 pt-2.5">
          <ProductCardLabel className="bg-label-muted">100 ml</ProductCardLabel>
        </div> */}
      </div>
    );
  }

  return null;
};
