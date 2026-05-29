import { Skeleton } from "@/components/ui/skeleton";

const DESKTOP_CHIP_WIDTHS = ["w-20", "w-16", "w-18", "w-20", "w-18", "w-20"];
const MOBILE_CHIP_WIDTHS = ["w-20", "w-16", "w-18", "w-14"];

export function CategoryTypeFilterSkeleton() {
  return (
    <>
      <div className="mb-2.5 hidden flex-wrap gap-2 lg:flex">
        {DESKTOP_CHIP_WIDTHS.map((width, idx) => (
          <Skeleton
            className={`rounded-4xl h-7 ${width}`}
            key={`category-type-filter-desktop-${idx}`}
          />
        ))}
      </div>

      <div className="mb-2.5 flex flex-wrap gap-2 lg:hidden">
        {MOBILE_CHIP_WIDTHS.map((width, idx) => (
          <Skeleton
            className={`rounded-4xl h-7 ${width}`}
            key={`category-type-filter-mobile-${idx}`}
          />
        ))}
      </div>
    </>
  );
}
