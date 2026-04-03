import { Skeleton } from "@/components/ui/skeleton";

export const ProductMediaThumbnailsSkeleton = () => {
  return (
    <div
      aria-hidden
      className="col-span-0 lg:h-148.75 hidden lg:col-span-1 lg:block"
    >
      <div className="flex flex-col gap-2.5">
        {[...Array(3)].map((_, index) => (
          <button
            className="bg-bg-default transition-default border-border-light-gray relative aspect-square overflow-hidden rounded-xl border"
            key={index}
            tabIndex={-1}
            type="button"
          >
            <Skeleton className="size-full" />
          </button>
        ))}
      </div>
    </div>
  );
};
