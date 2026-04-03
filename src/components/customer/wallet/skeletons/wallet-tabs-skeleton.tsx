import { Skeleton } from "@/components/ui/skeleton";

export function WalletTabsSkeleton() {
  return (
    <div className="mt-5 flex flex-row justify-between gap-2.5">
      {[...Array(3)].map((_, index) => (
        <Skeleton className="h-12.5 flex-1 rounded-xl" key={index} />
      ))}
    </div>
  );
}
