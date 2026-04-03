import { Skeleton } from "@/components/ui/skeleton";

export function OrderSummarySkeleton() {
  return (
    <div className="px-5 pb-4">
      {/* Price Details */}
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-10" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      {/* Green Success Message */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 flex-1" />
      </div>

      {/* Grand Total */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Bottom Info */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    </div>
  );
}
