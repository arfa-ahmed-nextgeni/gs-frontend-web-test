"use client";

import { useCarousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0",
        orientation === "horizontal" ? "ps-2.5" : "pt-2.5",
        className
      )}
      data-slot="carousel-item"
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}
