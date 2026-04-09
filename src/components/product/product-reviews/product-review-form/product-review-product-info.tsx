import { ProductCardPrice } from "@/components/product/product-card/product-card-price";
import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { getProductBasicInfo } from "@/lib/actions/products/get-product-basic-info";
import { getProductDetails } from "@/lib/actions/products/get-product-details";
import { Locale } from "@/lib/constants/i18n";
import { isOk } from "@/lib/utils/service-result";

type ProductReviewProductInfoCardProps = {
  description: string;
  image: string;
  name: string;
  oldPrice?: string;
  price?: string;
};

const ProductReviewProductInfoCard = ({
  description,
  image,
  name,
  oldPrice,
  price,
}: ProductReviewProductInfoCardProps) => (
  <div className="h-25 bg-bg-default flex w-full shrink-0 flex-row gap-2.5 rounded-xl p-2.5">
    <div className="relative aspect-square h-full overflow-hidden rounded-xl">
      <ProductImageWithFallback alt="product image" fill src={image} />
    </div>
    <div className="flex flex-1 flex-col justify-between py-1">
      <p className="text-text-primary line-clamp-1 text-xs font-semibold">
        {name}
      </p>
      <p className="text-text-primary line-clamp-2 text-xs font-normal">
        {description}
      </p>
      {price ? (
        <ProductCardPrice
          containerProps={{
            className: "px-0",
          }}
          oldPrice={oldPrice}
          price={price}
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

export const ProductReviewProductInfo = async ({
  params,
}: {
  params: Promise<{
    locale: string;
    urlKey: string;
  }>;
}) => {
  const { locale, urlKey } = await params;
  const productBasicInfoResponse = await getProductBasicInfo({
    urlKey,
  });

  if (isOk(productBasicInfoResponse)) {
    const product = productBasicInfoResponse.data;

    return (
      <ProductReviewProductInfoCard
        description={product.description}
        image={product.image}
        name={product.name}
        oldPrice={product.oldPrice}
        price={product.isConfigurable ? undefined : product.price}
      />
    );
  }

  const productDetailsResponse = await getProductDetails({
    locale: locale as Locale,
    urlKey: decodeURIComponent(urlKey),
  });

  if (isOk(productDetailsResponse)) {
    const product = productDetailsResponse.data;

    return (
      <ProductReviewProductInfoCard
        description={product.description}
        image={product.mediaGallery[0]?.url || ""}
        name={product.name}
        oldPrice={product.oldPrice}
        price={product.price}
      />
    );
  }

  return null;
};
