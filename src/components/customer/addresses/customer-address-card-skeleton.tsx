import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const CustomerAddressCardSkeleton = ({ index }: { index: number }) => {
  return (
    <div
      className={cn(
        "bg-bg-default flex flex-col rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]",
        {
          "bg-bg-surface lg:bg-bg-default": index !== 0,
        }
      )}
    >
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-row">
          <div className="w-20">
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <Skeleton className="h-4 w-[50%]" />
        </div>
        <div className="flex flex-row">
          <div className="w-20">
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[50%]" />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="w-20">
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <Skeleton className="h-4 w-[50%]" />
        </div>
      </div>
      <div
        className={cn(
          "h-11.25 border-border-base flex flex-row items-center justify-between border-t px-5",
          {
            "hidden lg:flex": index !== 0,
          }
        )}
      >
        <Skeleton
          className={cn("h-6 w-24 rounded-xl", { "w-18.5": index === 0 })}
        />
        <div className="gap-3.75 flex flex-row">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  );
};
