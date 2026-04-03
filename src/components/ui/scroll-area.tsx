"use client";

import * as React from "react";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils/index";

interface ScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  dynamicHeight?: boolean;
  maxHeight?: string;
  minHeight?: string;
  nativeOnMobile?: boolean;
  scrollAreaRef?: React.Ref<{ scrollToTop: VoidFunction }>;
  variant?: "arrows" | "default";
}

interface ScrollBarProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  variant?: "arrows" | "default";
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

function ScrollArea({
  children,
  className,
  dynamicHeight = false,
  maxHeight = "max-h-96",
  minHeight = "min-h-0",
  nativeOnMobile,
  scrollAreaRef,
  variant = "default",
  ...props
}: ScrollAreaProps) {
  const isMobile = useIsMobile();

  const viewportRef = React.useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    viewportRef.current?.scrollTo({ behavior: "smooth", top: 0 });
  };

  React.useImperativeHandle(scrollAreaRef, () => ({
    scrollToTop,
  }));

  if (isMobile && nativeOnMobile) {
    return (
      <div
        className={cn("scrollbar-hidden", className)}
        data-slot="scroll-area-native"
      >
        {children}
      </div>
    );
  }

  // Dynamic height calculation - simpler approach
  const dynamicHeightClass = dynamicHeight
    ? cn(minHeight, maxHeight, "h-auto")
    : "";

  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative", dynamicHeightClass, className)}
      data-slot="scroll-area"
      type="auto"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px]"
        data-slot="scroll-area-viewport"
        ref={viewportRef}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar variant={variant} viewportRef={viewportRef} />

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  variant = "default",
  viewportRef,
  ...props
}: ScrollBarProps) {
  const scrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startScrolling = (direction: "down" | "up") => {
    stopScrolling();
    scrollIntervalRef.current = setInterval(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollBy({
          behavior: "smooth",
          top: direction === "up" ? -20 : 20,
        });
      }
    }, 50);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleMouseDown = (direction: "down" | "up") => {
    startScrolling(direction);
    window.addEventListener("mouseup", stopScrolling, { once: true });
  };

  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      className={cn(
        "bg-bg-surface flex touch-none select-none rounded-full transition-colors",
        orientation === "vertical" &&
          (variant === "arrows"
            ? "h-full w-3.5 flex-col items-center bg-transparent"
            : "h-full w-1"),
        orientation === "horizontal" && "h-2.5 flex-col",
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      {orientation === "vertical" && variant === "arrows" && (
        <button
          className="h-6 w-full bg-[url('/assets/icons/arrow-up-icon.svg')] bg-center bg-no-repeat"
          onMouseDown={() => handleMouseDown("up")}
          onMouseEnter={() => startScrolling("up")}
          onMouseLeave={stopScrolling}
        />
      )}

      <ScrollAreaPrimitive.ScrollAreaThumb
        className="bg-bg-muted relative flex-1 rounded-full"
        data-slot="scroll-area-thumb"
      />

      {orientation === "vertical" && variant === "arrows" && (
        <button
          className="h-6 w-full bg-[url('/assets/icons/arrow-down-icon.svg')] bg-center bg-no-repeat"
          onMouseDown={() => handleMouseDown("down")}
          onMouseEnter={() => startScrolling("down")}
          onMouseLeave={stopScrolling}
        />
      )}
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
