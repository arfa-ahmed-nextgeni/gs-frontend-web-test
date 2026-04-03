import { Skeleton } from "@/components/ui/skeleton";

export function CustomerServiceContentSkeleton() {
  return (
    <div className="gap-7.5 flex flex-col">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}
