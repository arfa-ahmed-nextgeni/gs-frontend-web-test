import { Skeleton } from "@/components/ui/skeleton";

const MOBILE_CHIP_WIDTHS = ["w-20", "w-16", "w-24", "w-18", "w-22"];

export function CategoryFiltersListSkeleton() {
  return (
    <>
      <div className="gap-1.25 scrollbar-hidden flex flex-row overflow-x-auto lg:hidden">
        {MOBILE_CHIP_WIDTHS.map((width, idx) => (
          <Skeleton
            className={`rounded-4xl h-7 ${width}`}
            key={`category-filters-list-mobile-${idx}`}
          />
        ))}
      </div>

      <div className="lg:gap-1.25 hidden lg:flex lg:flex-col">
        <Skeleton className="h-7 rounded-xl" />
        <Skeleton className="h-7 rounded-xl" />
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton
            className="h-7 rounded-xl"
            key={`category-filters-list-desktop-${idx}`}
          />
        ))}
      </div>
    </>
  );
}
