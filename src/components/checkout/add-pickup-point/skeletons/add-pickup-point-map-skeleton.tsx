import { Skeleton } from "@/components/ui/skeleton";

export const AddPickupPointMapSkeleton = () => {
  return (
    <div className="relative h-1/2 flex-shrink-0">
      <Skeleton className="h-full w-full" />
      <div className="absolute top-2.5 z-10 flex w-full justify-center">
        <div className="w-9/10 relative">
          <Skeleton className="h-10 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
};
