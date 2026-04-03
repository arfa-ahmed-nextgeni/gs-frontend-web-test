import { Skeleton } from "@/components/ui/skeleton";

export const RegionLanguageSwitcherSkeleton = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-4xl bg-bg-surface flex h-10 items-center justify-between gap-2 px-5">
        <Skeleton className="h-3.75 w-5" />
        <Skeleton className="h-6 w-5" />
        <Skeleton className="h-1 w-2" />
      </div>
    </div>
  );
};
