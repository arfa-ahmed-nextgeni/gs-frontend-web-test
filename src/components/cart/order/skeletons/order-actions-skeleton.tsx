import { Skeleton } from "@/components/ui/skeleton";

export function OrderActionsSkeleton() {
  return (
    <div className="px-5 pt-4">
      {/* Top Actions */}
      <div className="mb-4 space-y-3">
        {/* Add Coupon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
        {/* Redeem Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-5" />
        </div>
        {/* Use Wallet */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
