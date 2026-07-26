import { Skeleton } from "@/components/ui/skeleton";

export function OrderSummarySkeleton() {
  return (
    <div className="bg-bg-default pt-7.5 flex flex-col gap-3 rounded-xl border-0 pb-5 shadow-none">
      <div className="px-6">
        <Skeleton className="h-7.5 w-40" />
      </div>

      <div className="px-5 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="w-18 h-4" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-22 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>

        <div className="bg-label-accent-light text-text-primary mt-2 flex justify-center gap-1 rounded-[5px] py-2">
          <Skeleton className="h-3.5 w-48" />
        </div>

        <div className="border-border-base my-5 border-t" />

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
