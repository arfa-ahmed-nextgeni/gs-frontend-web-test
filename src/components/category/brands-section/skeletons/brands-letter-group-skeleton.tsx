import { BrandCardSkeleton } from "@/components/category/brands-section/skeletons/brand-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const BrandsLetterGroupSkeleton = () => {
  return (
    <div className="gap-12.5 flex w-full flex-col">
      {[...Array(2)].map((_, index) => {
        return (
          <div className="flex flex-col gap-5" key={index}>
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-4" />
              <span className="bg-bg-surface h-0.5 flex-1 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-[clamp(5px,calc(5px+(100vw-320px)*5/110),10px)] gap-y-[clamp(10px,calc(10px+(100vw-320px)*10/110),20px)]">
              {[...Array(16)].map((_, i) => (
                <BrandCardSkeleton key={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
