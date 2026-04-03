"use client";

import { useCarousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function CarouselDots({
  className,
  dotActiveClassName,
  dotClassName,
  idPrefix,
  visible,
  ...props
}: {
  dotActiveClassName?: React.ComponentProps<"button">["className"];
  dotClassName?: React.ComponentProps<"button">["className"];
  idPrefix?: string;
  visible?: boolean;
} & React.ComponentProps<"div">) {
  const { api, scrollTo, selectedIndex } = useCarousel();

  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute bottom-2.5 flex w-full flex-row items-center justify-center",
        className
      )}
      role="tablist"
      {...props}
    >
      {api?.scrollSnapList().map((_, index) => {
        const slideId = idPrefix
          ? `${idPrefix}-carousel-item-${index}`
          : `carousel-item-${index}`;

        return (
          <button
            aria-controls={slideId}
            aria-label={`Slide ${index + 1}`}
            aria-selected={index === selectedIndex}
            className={cn(
              "after:transition-default flex size-6 cursor-pointer items-center justify-center after:block after:size-1.5 after:rounded-full",
              "after:bg-bg-default after:opacity-60",
              dotClassName,
              index === selectedIndex &&
                cn("after:bg-bg-primary after:opacity-100", dotActiveClassName)
            )}
            data-slot="carousel-dot"
            key={index}
            onClick={() => scrollTo(index)}
            role="tab"
          />
        );
      })}
    </div>
  );
}
