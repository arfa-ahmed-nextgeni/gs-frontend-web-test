import { ProductMediaThumbnailsSkeleton } from "@/components/product/product-media-gallery/product-media-thumbnails-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductMediaGallerySkeleton = ({
  showImageSkeleton = true,
}: {
  showImageSkeleton?: boolean;
}) => {
  return (
    <div className="col-span-6 grid grid-cols-6 gap-2.5 md:col-span-7 md:h-full md:min-h-0 lg:col-span-7 lg:grid-cols-7">
      <ProductMediaThumbnailsSkeleton />
      <div className="bg-bg-default relative col-span-6 aspect-square min-h-0 overflow-hidden md:aspect-auto md:h-full md:rounded-xl lg:rounded-xl">
        {showImageSkeleton && <Skeleton className="size-full" />}
      </div>
    </div>
  );
};
