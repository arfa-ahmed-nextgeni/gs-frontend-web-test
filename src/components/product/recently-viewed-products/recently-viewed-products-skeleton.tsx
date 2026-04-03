import { CategoryProductsCarouselSkeleton } from "@/components/product/category-products-carousel-skeleton";
import Container from "@/components/shared/container";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export function RecentlyViewedProductsSkeleton({
  maximumProducts,
}: {
  maximumProducts: number;
}) {
  return (
    <Container className="lg:mt-7.5 mt-5">
      <CategoryProductsCarouselSkeleton
        maximumProducts={maximumProducts}
        variant={ProductCardVariant.Single}
      />
    </Container>
  );
}
