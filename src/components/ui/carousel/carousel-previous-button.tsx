"use client";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselPreviousButton({
  className,
  size = "icon",
  variant = "default",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canScrollPrev, orientation, scrollPrev } = useCarousel();

  if (!canScrollPrev) {
    return null;
  }

  return (
    <Button
      className={cn(
        "absolute hidden lg:block",
        orientation === "horizontal"
          ? "start-0 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        // ? "-left-12 top-1/2 -translate-y-1/2"
        className
      )}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      size={size}
      variant={variant}
      {...props}
    >
      {props.children}
    </Button>
  );
}
