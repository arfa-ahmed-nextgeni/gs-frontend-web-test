import { Skeleton } from "@/components/ui/skeleton";

export const AddGiftWrappingFormSkeleton = () => {
  return (
    <div className="scrollbar-hidden flex max-h-full flex-col gap-4 overflow-y-auto px-5 py-4">
      {[...Array(2)].map((_, sectionIndex) => (
        <div className="flex flex-col gap-2" key={sectionIndex}>
          <Skeleton className="h-4 w-40" />
          <div className="scrollbar-hidden flex gap-[10px] overflow-x-auto">
            {[...Array(3)].map((__, cardIndex) => (
              <div
                className="border-border-base bg-bg-default flex w-[140px] shrink-0 flex-col rounded-[10px] border shadow-[0px_1px_0px_0px_#f3f3f3]"
                key={cardIndex}
              >
                <Skeleton className="h-[140px] w-full rounded-t-[10px]" />
                <div className="flex flex-1 flex-col gap-[10px] px-3 pb-5 pt-3">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-[80px] w-full rounded-[10px]" />
      </div>

      <div className="flex flex-col gap-3 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex items-start gap-2">
          <Skeleton className="mt-1 h-3 w-3 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <Skeleton className="h-[50px] w-full rounded-[10px]" />
      </div>
    </div>
  );
};
