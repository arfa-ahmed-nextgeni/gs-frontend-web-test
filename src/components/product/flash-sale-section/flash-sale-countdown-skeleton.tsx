import { Skeleton } from "@/components/ui/skeleton";

export const FlashSaleCountdownSkeleton = ({
  sentinelRef,
}: {
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div aria-hidden className="flex gap-2.5 lg:mb-0 lg:mt-0" ref={sentinelRef}>
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          className="bg-bg-brand h-12.5 w-15 flex flex-col items-center justify-center rounded-xl"
          key={index}
        >
          <Skeleton className="mb-1 h-5 w-8 bg-white/20" />
          <Skeleton className="h-3 w-12 bg-white/20" />
        </div>
      ))}
    </div>
  );
};
