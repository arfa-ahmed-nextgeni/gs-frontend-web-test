import { connection } from "next/server";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { ProductCarouselSection } from "@/components/product/product-carousel-section";
import Container from "@/components/shared/container";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import {
  ProductLinkType,
  ProductType,
} from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const SimilarProductsSection = ({
  product,
}: {
  product: ProductDetailsModel;
}) => (
  <AsyncBoundary
    fallback={
      <Container className="mb-7.5 px-0!">
        <CategoryProductsCarouselItemsSkeleton
          carouselProps={{
            className:
              "[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0.625rem] lg:[&>[data-slot=scroll-snap-carousel-viewport]]:[scroll-padding-inline:0px]",
          }}
          contentProps={{
            className: "w-max ps-2.5 pe-2.5 lg:ps-0 lg:pe-0",
          }}
          maximumProducts={8}
          variant={ProductCardVariant.Single}
        />
      </Container>
    }
  >
    <SimilarProductsLeaf product={product} />
  </AsyncBoundary>
);

const SimilarProductsLeaf = async ({
  product,
}: {
  product: ProductDetailsModel;
}) => {
  await connection();

  return (
    <ProductCarouselSection
      excludeTypes={[ProductType.EGiftCard]}
      linkType={ProductLinkType.Similar}
      productInfo={{
        brand: product.brand || "",
        gender: product.productInfo.gender || "",
        productType: product.productInfo.type || "",
        sku: product.sku,
        urlKey: product.urlKey,
      }}
      productType={product.type}
      titleKey="similarProductsSection"
    />
  );
};
