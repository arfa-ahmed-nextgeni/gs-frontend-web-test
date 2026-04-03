import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WalletFooterLinksSkeletonProps {
  className?: string;
}

export function WalletFooterLinksSkeleton({
  className,
}: WalletFooterLinksSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-bg-default flex w-full flex-row items-center justify-between px-5 lg:static lg:bg-transparent lg:px-0",
        "h-12.5 mt-21.25 fixed inset-x-0 bottom-0",
        className
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
