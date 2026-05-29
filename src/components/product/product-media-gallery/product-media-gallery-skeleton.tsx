import { ProductMediaThumbnailsSkeleton } from "@/components/product/product-media-gallery/product-media-thumbnails-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductMediaGallerySkeleton = ({
  showImageSkeleton = true,
}: {
  showImageSkeleton?: boolean;
}) => {
  return (
    <div className="col-span-6 grid aspect-square grid-cols-6 gap-2.5 md:col-span-7 md:aspect-auto lg:col-span-7 lg:aspect-auto lg:grid-cols-7">
      <ProductMediaThumbnailsSkeleton />
      <div className="bg-bg-default relative col-span-6 overflow-hidden md:rounded-xl lg:rounded-xl">
        {showImageSkeleton && <Skeleton className="size-full" />}
      </div>
    </div>
  );
};
