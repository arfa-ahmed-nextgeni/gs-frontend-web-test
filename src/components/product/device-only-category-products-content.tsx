import { DeviceOnlyContent } from "@/components/common/device-only-content";
import { CategoryProductsCarouselItemsSkeleton } from "@/components/product/category-products-carousel-items-skeleton";
import { ProductCardVariant } from "@/lib/constants/product/product-card";

export const DeviceOnlyCategoryProductsContent = ({
  children,
  device,
  maximumProducts,
  variant,
}: {
  children: React.ReactNode;
  device: "desktop" | "mobile";
  maximumProducts: number;
  variant: ProductCardVariant;
}) => {
  return (
    <DeviceOnlyContent
      device={device}
      fallback={
        <CategoryProductsCarouselItemsSkeleton
          maximumProducts={maximumProducts}
          variant={variant}
        />
      }
    >
      {children}
    </DeviceOnlyContent>
  );
};
