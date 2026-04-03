import { Skeleton } from "@/components/ui/skeleton";

export function WalletCashbackHistoryItemSkeleton() {
  return (
    <div className="bg-bg-default h-12.5 border-border-light flex flex-row items-center justify-between border-b px-5 first:rounded-t-xl last:rounded-b-xl lg:rounded-xl">
      <div className="flex flex-row items-center gap-2.5">
        <Skeleton className="size-5 rounded-full" />

        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2.5">
          <Skeleton className="w-38.5 h-5" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Skeleton className="h-5 w-16" />
    </div>
  );
}
