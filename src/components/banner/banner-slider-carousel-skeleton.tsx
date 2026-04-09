import type { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const BannerSliderCarouselSkeleton = ({
  className,
  style,
}: Pick<ComponentProps<"div">, "className" | "style">) => {
  return (
    <div className={cn("relative w-full", className)} style={style}>
      <Skeleton className="h-full w-full rounded-none" />

      <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            className={cn(
              "size-1.5 rounded-full bg-white/60",
              index === 0 && "bg-white"
            )}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};
