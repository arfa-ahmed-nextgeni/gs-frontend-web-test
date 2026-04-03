import { ProductAdditionalInfoSkeleton } from "@/components/product/product-additional-info/product-additional-info-skeleton";
import { ProductDetailsSkeleton } from "@/components/product/product-details/product-details-skeleton";
import { ProductMediaGallerySkeleton } from "@/components/product/product-media-gallery/product-media-gallery-skeleton";
import Container from "@/components/shared/container";

export default function ProductPageLoading() {
  return (
    <div className="pb-22.5">
      {/* <DesktopBreadcrumbSkeleton /> */}

      <Container className="lg:h-148.75 lg:mt-12.5 mb-2.5 grid grid-cols-6 gap-5 !px-0 lg:grid-cols-12 lg:gap-2.5">
        <ProductMediaGallerySkeleton />
        <ProductDetailsSkeleton />
      </Container>

      <ProductAdditionalInfoSkeleton />
    </div>
  );
}
