import { Skeleton } from "@/components/ui/skeleton";

export const BrandCardSkeleton = () => (
  <div className="max-w-30.5 lg:max-w-35.25 lg:w-35.25 flex w-[27vw] flex-col gap-2.5">
    <div className="bg-bg-default h-26 lg:h-30 relative w-full overflow-hidden rounded-xl">
      <Skeleton className="size-full p-3.5 lg:p-5" />
    </div>
    <Skeleton className="mx-auto h-4 w-4/5" />
  </div>
);
