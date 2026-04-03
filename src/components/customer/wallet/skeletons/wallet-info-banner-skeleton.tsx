import { Skeleton } from "@/components/ui/skeleton";

export function WalletInfoBannerSkeleton() {
  return (
    <div className="flex h-[50px] items-center gap-[15px] rounded-xl bg-gray-100 px-4">
      <Skeleton className="size-[38px] rounded-full" />
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}
