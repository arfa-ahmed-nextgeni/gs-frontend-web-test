import { Suspense } from "react";

import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { ProductCarouselSection } from "@/components/product/product-carousel-section";
import Container from "@/components/shared/container";
import { ProductCardVariant } from "@/lib/constants/product/product-card";
import {
  ProductLinkType,
  ProductType,
} from "@/lib/constants/product/product-details";
import { ProductDetailsModel } from "@/lib/models/product-details-model";

export const YouMightAlsoLikeProductsSection = async ({
  product,
}: {
  product: ProductDetailsModel;
}) => (
  <Suspense
    fallback={
      <Container className="mb-7.5 !px-0">
        <CategoryProductsCarouselItemsSkeleton
          maximumProducts={8}
          variant={ProductCardVariant.Single}
        />
      </Container>
    }
  >
    <ProductCarouselSection
      excludeTypes={[ProductType.EGiftCard]}
      linkType={ProductLinkType.AlsoLike}
      productInfo={{
        brand: product.brand || "",
        gender: product.productInfo.gender || "",
        productType: product.productInfo.type || "",
        sku: product.sku,
      }}
      productType={product.type}
      titleKey="youMightAlsoLikeSection"
    />
  </Suspense>
);
