import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const FlashSaleCountdownSkeleton = ({
  layout,
  sentinelRef,
}: {
  layout: "desktop" | "mobile";
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const isMobile = layout === "mobile";

  return (
    <div
      aria-hidden
      className={cn("mt-12 flex gap-2.5 lg:mb-10", isMobile && "flex-col")}
      ref={sentinelRef}
    >
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          className={cn(
            "bg-bg-brand h-12.5 flex flex-col items-center justify-center rounded-xl",
            isMobile ? "w-12.5" : "w-15"
          )}
          key={index}
        >
          <Skeleton className="mb-1 h-5 w-8 bg-white/20" />
          <Skeleton
            className={cn("h-3 bg-white/20", isMobile ? "w-10" : "w-12")}
          />
        </div>
      ))}
    </div>
  );
};
