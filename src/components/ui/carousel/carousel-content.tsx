"use client";

import { useCarousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselContent({
  className,
  containerProps,
  ...props
}: {
  containerProps?: React.ComponentProps<"div">;
} & React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      {...containerProps}
      className={cn("overflow-hidden", containerProps?.className)}
      data-slot="carousel-content"
      ref={carouselRef}
    >
      <div
        className={cn(
          "transition-default flex",
          orientation === "horizontal" ? "-ms-2.5" : "-mt-2.5 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
}
