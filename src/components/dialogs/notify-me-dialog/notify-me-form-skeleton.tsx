import { Skeleton } from "@/components/ui/skeleton";

export const NotifyMeFormSkeleton = () => {
  return (
    <div className="mt-6.25 flex flex-col gap-10">
      <Skeleton className="h-12.5 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};
