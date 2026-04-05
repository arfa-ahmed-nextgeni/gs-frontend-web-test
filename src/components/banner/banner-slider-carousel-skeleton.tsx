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
    </div>
  );
};
