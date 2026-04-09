"use client";

import * as React from "react";

import {
  ScrollSnapCarousel,
  type ScrollSnapCarouselDotsProps,
  ScrollSnapCarouselItem,
} from "@/components/ui/scroll-snap-carousel";
import {
  getScrollOffsetFromStart,
  scrollToOffsetFromStart,
} from "@/lib/utils/rtl-scroll";

type BannerScrollSnapCarouselProps = React.PropsWithChildren<
  {
    autoPlay?: {
      delay?: number;
      enabled?: boolean;
    };
    contentProps?: React.ComponentProps<"div">;
    dotsProps?: ScrollSnapCarouselDotsProps;
    nextButtonProps?: React.ComponentProps<"button">;
    nextIconProps?: React.SVGAttributes<object>;
    previousButtonProps?: React.ComponentProps<"button">;
    previousIconProps?: React.SVGAttributes<object>;
    slideGapPx?: number;
  } & React.ComponentProps<"div">
>;

export function BannerScrollSnapCarousel({
  autoPlay,
  children,
  contentProps,
  dotsProps,
  nextButtonProps,
  nextIconProps,
  previousButtonProps,
  previousIconProps,
  slideGapPx = 0,
  ...props
}: BannerScrollSnapCarouselProps) {
  const reactId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = React.useRef<null | number>(null);
  const isPointerInteractingRef = React.useRef(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const slides = React.Children.toArray(children);
  const slideIds = slides.map((slide, index) => {
    if (React.isValidElement<{ id?: string }>(slide) && slide.props.id) {
      return slide.props.id;
    }

    return `${reactId.replaceAll(":", "")}-carousel-item-${index}`;
  });
  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < slides.length - 1;
  const autoplayDelay = autoPlay?.delay ?? 3000;
  const autoplayEnabled = Boolean(autoPlay?.enabled);

  const scrollToIndex = React.useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(index, slides.length - 1));
      const slideStep = viewport.clientWidth + slideGapPx;

      if (slideStep <= 0) {
        return;
      }

      scrollToOffsetFromStart(viewport, clampedIndex * slideStep, {
        behavior,
      });
    },
    [slideGapPx, slides.length]
  );

  const scrollPrev = React.useCallback(() => {
    if (!canScrollPrev) {
      return;
    }

    scrollToIndex(selectedIndex - 1);
  }, [canScrollPrev, scrollToIndex, selectedIndex]);

  const scrollNext = React.useCallback(() => {
    if (!canScrollNext) {
      return;
    }

    scrollToIndex(selectedIndex + 1);
  }, [canScrollNext, scrollToIndex, selectedIndex]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollNext, scrollPrev]
  );

  React.useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const ownerWindow = viewport.ownerDocument.defaultView ?? window;
    const syncSelectedIndex = () => {
      const nextIndex = getBannerSelectedIndex(viewport, slideGapPx);

      setSelectedIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex
      );
    };
    const scheduleSyncSelectedIndex = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = ownerWindow.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        syncSelectedIndex();
      });
    };
    const handleResize = () => {
      scheduleSyncSelectedIndex();
    };

    viewport.addEventListener("scroll", scheduleSyncSelectedIndex, {
      passive: true,
    });
    ownerWindow.addEventListener("resize", handleResize, {
      passive: true,
    });
    syncSelectedIndex();

    return () => {
      viewport.removeEventListener("scroll", scheduleSyncSelectedIndex);
      ownerWindow.removeEventListener("resize", handleResize);

      if (scrollFrameRef.current !== null) {
        ownerWindow.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [slideGapPx, slides.length]);

  React.useEffect(() => {
    const viewport = viewportRef.current;

    if (!autoplayEnabled || !viewport || slides.length <= 1) {
      return;
    }

    const ownerDocument = viewport.ownerDocument;
    const ownerWindow = ownerDocument.defaultView ?? window;
    let timeoutId: null | number = null;

    const clearAutoplay = () => {
      if (timeoutId === null) {
        return;
      }

      ownerWindow.clearTimeout(timeoutId);
      timeoutId = null;
    };

    const scheduleAutoplay = () => {
      clearAutoplay();

      if (ownerDocument.visibilityState === "hidden") {
        return;
      }

      if (isPointerInteractingRef.current) {
        return;
      }

      timeoutId = ownerWindow.setTimeout(() => {
        if (selectedIndex < slides.length - 1) {
          scrollToIndex(selectedIndex + 1);
          return;
        }

        scrollToIndex(0, "auto");
      }, autoplayDelay);
    };

    const handlePointerDown = () => {
      isPointerInteractingRef.current = true;
      clearAutoplay();
    };

    const handlePointerUp = () => {
      isPointerInteractingRef.current = false;
      scheduleAutoplay();
    };

    const handleVisibilityChange = () => {
      scheduleAutoplay();
    };

    viewport.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    viewport.addEventListener("pointerup", handlePointerUp, {
      passive: true,
    });
    viewport.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });
    viewport.addEventListener("pointerleave", handlePointerUp, {
      passive: true,
    });
    ownerDocument.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleAutoplay();

    return () => {
      clearAutoplay();
      isPointerInteractingRef.current = false;
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      viewport.removeEventListener("pointercancel", handlePointerUp);
      viewport.removeEventListener("pointerleave", handlePointerUp);
      ownerDocument.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    autoplayDelay,
    autoplayEnabled,
    scrollToIndex,
    selectedIndex,
    slides.length,
  ]);

  return (
    <ScrollSnapCarousel
      {...props}
      canScrollNext={canScrollNext}
      canScrollPrev={canScrollPrev}
      contentProps={contentProps}
      dotsProps={dotsProps}
      nextButtonProps={nextButtonProps}
      nextIconProps={nextIconProps}
      onKeyDownCapture={(event) => {
        handleKeyDown(event);
        props.onKeyDownCapture?.(event);
      }}
      onScrollNext={scrollNext}
      onScrollPrev={scrollPrev}
      onScrollToIndex={scrollToIndex}
      previousButtonProps={previousButtonProps}
      previousIconProps={previousIconProps}
      selectedIndex={selectedIndex}
      slideIds={slideIds}
      viewportRef={viewportRef}
    >
      {children}
    </ScrollSnapCarousel>
  );
}

export { ScrollSnapCarouselItem };

function getBannerSelectedIndex(viewport: HTMLDivElement, slideGapPx: number) {
  if (viewport.clientWidth <= 0) {
    return 0;
  }

  const logicalScrollLeft = getScrollOffsetFromStart(viewport);
  const slideStep = viewport.clientWidth + slideGapPx;

  return Math.max(0, Math.round(logicalScrollLeft / slideStep));
}
