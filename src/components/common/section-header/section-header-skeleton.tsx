import { Skeleton } from "@/components/ui/skeleton";

export const SectionHeaderSkeleton = () => {
  return (
    <div className="relative flex flex-row items-center justify-between">
      <Skeleton className="h-7.5 w-32.5" />
      <Skeleton className="h-5.5 w-11.5" />
    </div>
  );
};
