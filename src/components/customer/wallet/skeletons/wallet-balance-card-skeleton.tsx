import { Skeleton } from "@/components/ui/skeleton";

export function WalletBalanceCardSkeleton() {
  return (
    <div className="bg-bg-success flex h-[133px] flex-row justify-between rounded-none p-5 lg:hidden">
      <div className="flex flex-row">
        <div className="flex flex-col">
          <Skeleton className="h-6 w-32" />
          <div className="-mt-4 flex items-center gap-2">
            <Skeleton className="h-[40px] w-[40px]" />
            <Skeleton className="h-[75px] w-24" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Skeleton className="size-[133px] rounded-full" />
        <Skeleton className="size-5" />
      </div>
    </div>
  );
}
