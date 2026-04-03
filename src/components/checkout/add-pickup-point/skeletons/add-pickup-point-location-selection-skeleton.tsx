import { Skeleton } from "@/components/ui/skeleton";

export const AddPickupPointLocationSelectionSkeleton = () => {
  return (
    <>
      <Skeleton className="h-5 w-32" />
      <div className="flex flex-col gap-2">
        {[...Array(2)].map((_, index) => (
          <div
            className="border-border-base bg-bg-default rounded-xl border"
            key={index}
          >
            <div className="min-h-11.25 flex items-center justify-between px-5 py-3">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex items-center gap-5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2.5 w-5" />
              </div>
            </div>

            <div className="flex flex-col gap-5 p-5">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <div className="flex flex-col gap-0.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-12.5 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
