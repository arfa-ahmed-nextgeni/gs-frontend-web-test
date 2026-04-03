"use client";

import { useCarousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselNextButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { canScrollNext, orientation, scrollNext } = useCarousel();

  if (!canScrollNext) {
    return null;
  }

  return (
    <button
      className={cn(
        "transition-default disabled:bg-btn-bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 absolute hidden items-center justify-center whitespace-nowrap rounded-md text-sm font-medium outline-none focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        "size-auto",
        "lg:inline-flex",
        orientation === "horizontal"
          ? "end-0 top-1/2 -translate-y-1/2"
          : // ? "-right-12 top-1/2 -translate-y-1/2"
            "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      type="button"
      {...props}
    >
      {props.children}
    </button>
  );
}
