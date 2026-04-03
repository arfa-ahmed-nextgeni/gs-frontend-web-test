import { Skeleton } from "@/components/ui/skeleton";

export const ProductMediaGallerySkeleton = () => {
  return (
    <div className="col-span-6 grid aspect-square grid-cols-6 gap-2.5 lg:col-span-7 lg:aspect-auto lg:grid-cols-7">
      <div className="col-span-0 lg:h-148.75 hidden lg:col-span-1 lg:block">
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, index) => (
            <button
              className="bg-bg-default transition-default border-border-light-gray relative aspect-square overflow-hidden rounded-xl border"
              key={index}
            >
              <Skeleton className="size-full" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-bg-default relative col-span-6 overflow-hidden lg:rounded-xl">
        <Skeleton className="size-full" />
      </div>
    </div>
  );
};
