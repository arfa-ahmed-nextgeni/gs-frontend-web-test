import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CartListSkeleton() {
  const skeletonItems = Array.from({ length: 3 });

  return (
    <>
      {skeletonItems.map((_, i) => (
        <div
          className={cn(
            "border-border-base bg-bg-default lg:h-37.5 h-52.5 relative flex flex-row gap-5 overflow-hidden rounded-none border-b p-5 last:border-none lg:gap-2.5 lg:p-2.5",
            i === 0 && "rounded-t-xl",
            i === skeletonItems.length - 1 && "rounded-b-xl"
          )}
          key={i}
        >
          <div className="gap-1.25 absolute right-5 top-5 flex flex-row items-start rtl:left-5 rtl:right-auto">
            <Skeleton className="h-6.25 w-12 rounded-xl" />
            <Skeleton className="h-6.25 w-10 rounded-xl" />
          </div>

          <div className="w-32.5 lg:max-w-32.5 lg:w-32.5 flex shrink-0 flex-col justify-between gap-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex w-full items-center justify-between rounded-full bg-gray-50 px-3 py-2 lg:hidden">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-4 w-5" />
              <Skeleton className="size-3.5 rounded-full" />
            </div>
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col justify-between">
            <div className="flex flex-1 flex-row justify-between gap-5 lg:flex-col lg:gap-2.5">
              <div className="flex h-full flex-1 flex-col justify-between lg:pb-2">
                <div className="pt-8.5 space-y-1.5 lg:pr-28 lg:pt-2.5 rtl:lg:pl-28 rtl:lg:pr-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>

                <Skeleton className="bg-label-muted mt-2 h-6 w-16 rounded-full" />

                <div className="flex min-w-0 items-center justify-between gap-3 lg:gap-5">
                  <div className="flex min-w-0 items-center gap-5">
                    <div className="w-30 max-w-30 hidden items-center justify-between rounded-full bg-gray-50 px-3 py-2 lg:flex">
                      <Skeleton className="size-4 rounded-full" />
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="size-4 rounded-full" />
                    </div>

                    <div className="mt-4 flex shrink-0 flex-row items-center gap-1 lg:pb-3">
                      <Skeleton className="w-18 h-5" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>

                  <Skeleton className="size-8 rounded-xl lg:mr-2.5 lg:size-9 rtl:ml-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
