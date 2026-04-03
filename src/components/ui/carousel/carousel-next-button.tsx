"use client";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselNextButton({
  className,
  size = "icon",
  variant = "default",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canScrollNext, orientation, scrollNext } = useCarousel();

  if (!canScrollNext) {
    return null;
  }

  return (
    <Button
      className={cn(
        "absolute hidden lg:block",
        orientation === "horizontal"
          ? "end-0 top-1/2 -translate-y-1/2"
          : // ? "-right-12 top-1/2 -translate-y-1/2"
            "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      size={size}
      variant={variant}
      {...props}
    >
      {props.children}
    </Button>
  );
}
