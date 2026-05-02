"use client";

import * as React from "react";

import {
  ScrollSnapCarousel,
  type ScrollSnapCarouselDotsProps,
  ScrollSnapCarouselItem,
} from "@/components/ui/scroll-snap-carousel";
import { DEFERRED_CAROUSEL_ROOT_MARGIN } from "@/lib/constants/carousel";
import { cn } from "@/lib/utils";
import {
  getScrollOffsetFromStart,
  scrollToOffsetFromStart,
} from "@/lib/utils/rtl-scroll";

import type { CarouselHandle } from "@/lib/types/ui-types";

type CardRailDeferredActivation = {
  rootMargin?: string;
};

type CardRailScrollSnapCarouselProps = React.PropsWithChildren<{
  apiRef?: React.Ref<CarouselHandle>;
  carouselProps?: {
    autoPlay?: {
      delay?: number;
      enabled?: boolean;
    };
    className?: React.ComponentProps<"div">["className"];
    deferUntilInView?: boolean | CardRailDeferredActivation;
    onIndexChange?: (index: number) => void;
  };
  contentProps?: React.ComponentProps<"div">;
  dotsProps?: ScrollSnapCarouselDotsProps;
  nextButtonProps?: React.ComponentProps<"button">;
  nextIconProps?: React.SVGAttributes<object>;
  previousButtonProps?: React.ComponentProps<"button">;
  previousIconProps?: React.SVGAttributes<object>;
}>;

export function CardRailScrollSnapCarousel({
  apiRef,
  carouselProps,
  children,
  contentProps,
  dotsProps,
  nextButtonProps,
  nextIconProps,
  previousButtonProps,
  previousIconProps,
}: CardRailScrollSnapCarouselProps) {
  const reactId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = React.useRef<null | number>(null);
  const isPointerInteractingRef = React.useRef(false);
  const snapIdsRef = React.useRef<string[]>([]);
  const snapPositionsRef = React.useRef<number[]>([]);
  const slides = React.Children.toArray(children);
  const slideIds = slides.map((slide, index) => {
    if (React.isValidElement<{ id?: string }>(slide) && slide.props.id) {
      return slide.props.id;
    }

    return `${reactId.replaceAll(":", "")}-card-rail-item-${index}`;
  });
  const shouldDeferUntilInView = Boolean(carouselProps?.deferUntilInView);
  const deferRootMargin =
    typeof carouselProps?.deferUntilInView === "object"
      ? (carouselProps.deferUntilInView.rootMargin ??
        DEFERRED_CAROUSEL_ROOT_MARGIN)
      : DEFERRED_CAROUSEL_ROOT_MARGIN;
  const [isSnapLogicActive, setIsSnapLogicActive] = React.useState(
    !shouldDeferUntilInView
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(slides.length);
  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = selectedIndex < snapCount - 1;
  const autoplayDelay = carouselProps?.autoPlay?.delay ?? 3000;
  const autoplayEnabled = Boolean(carouselProps?.autoPlay?.enabled);

  const syncSnapState = React.useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const { snapIds, snapPositions } = getCardRailSnapPoints(viewport);

    snapIdsRef.current = snapIds;
    snapPositionsRef.current = snapPositions;
    setSnapCount(snapPositions.length);

    const nextIndex = getNearestSnapIndex(
      getScrollOffsetFromStart(viewport),
      snapPositions
    );

    setSelectedIndex((currentIndex) =>
      currentIndex === nextIndex ? currentIndex : nextIndex
    );
  }, []);

  const scrollToIndex = React.useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      const snapPositions =
        snapPositionsRef.current.length > 0
          ? snapPositionsRef.current
          : getCardRailSnapPoints(viewport).snapPositions;

      if (!snapPositions.length) {
        return;
      }

      const clampedIndex = Math.max(
        0,
        Math.min(index, snapPositions.length - 1)
      );

      scrollToOffsetFromStart(viewport, snapPositions[clampedIndex], {
        behavior,
      });
    },
    []
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
    carouselProps?.onIndexChange?.(selectedIndex);
  }, [carouselProps, selectedIndex]);

  React.useImperativeHandle(
    apiRef,
    () => ({
      scrollNext,
      scrollPrev,
      scrollTo: scrollToIndex,
      selectedIndex,
    }),
    [scrollNext, scrollPrev, scrollToIndex, selectedIndex]
  );

  React.useEffect(() => {
    if (!shouldDeferUntilInView || isSnapLogicActive) {
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      setIsSnapLogicActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setIsSnapLogicActive(true);
        observer.disconnect();
      },
      {
        rootMargin: deferRootMargin,
      }
    );

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [deferRootMargin, isSnapLogicActive, shouldDeferUntilInView]);

  React.useEffect(() => {
    if (!isSnapLogicActive) {
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const ownerWindow = viewport.ownerDocument.defaultView ?? window;
    const scheduleSyncSnapState = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = ownerWindow.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        syncSnapState();
      });
    };
    const handleResize = () => {
      syncSnapState();
    };

    viewport.addEventListener("scroll", scheduleSyncSnapState, {
      passive: true,
    });
    ownerWindow.addEventListener("resize", handleResize, {
      passive: true,
    });
    syncSnapState();

    return () => {
      viewport.removeEventListener("scroll", scheduleSyncSnapState);
      ownerWindow.removeEventListener("resize", handleResize);

      if (scrollFrameRef.current !== null) {
        ownerWindow.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [isSnapLogicActive, slides.length, syncSnapState]);

  React.useEffect(() => {
    if (
      !autoplayEnabled ||
      !isSnapLogicActive ||
      snapCount <= 1 ||
      !viewportRef.current
    ) {
      return;
    }

    const viewport = viewportRef.current;
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
        if (selectedIndex < snapCount - 1) {
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
    isSnapLogicActive,
    scrollToIndex,
    selectedIndex,
    snapCount,
  ]);

  return (
    <ScrollSnapCarousel
      canScrollNext={canScrollNext}
      canScrollPrev={canScrollPrev}
      className={cn("w-full", carouselProps?.className)}
      contentProps={{
        ...contentProps,
        className: cn("ms-0 gap-2.5", contentProps?.className),
      }}
      dotIds={snapIdsRef.current}
      dotsProps={dotsProps}
      nextButtonProps={nextButtonProps}
      nextIconProps={nextIconProps}
      onKeyDownCapture={handleKeyDown}
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

export { ScrollSnapCarouselItem as CardRailScrollSnapCarouselItem };

function clampLogicalScrollLeft(
  logicalScrollLeft: number,
  maxLogicalScrollLeft: number
) {
  return Math.max(
    0,
    Math.min(Math.round(logicalScrollLeft), maxLogicalScrollLeft)
  );
}

function dedupeSnapPoints(
  snapPoints: readonly { id: string; position: number }[]
) {
  if (!snapPoints.length) {
    return {
      snapIds: [],
      snapPositions: [0],
    };
  }

  return snapPoints.reduce<{
    snapIds: string[];
    snapPositions: number[];
  }>(
    (result, snapPoint) => {
      const lastPosition = result.snapPositions.at(-1);

      if (
        lastPosition === undefined ||
        Math.abs(snapPoint.position - lastPosition) > 1
      ) {
        result.snapIds.push(snapPoint.id);
        result.snapPositions.push(snapPoint.position);
      }

      return result;
    },
    {
      snapIds: [],
      snapPositions: [],
    }
  );
}

function getCardRailSnapPoints(viewport: HTMLDivElement) {
  const slideElements = Array.from(
    viewport.querySelectorAll<HTMLDivElement>(
      "[data-slot='scroll-snap-carousel-item']"
    )
  );

  if (!slideElements.length) {
    return {
      snapIds: [],
      snapPositions: [0],
    };
  }

  const currentLogicalScrollLeft = getScrollOffsetFromStart(viewport);
  const maxLogicalScrollLeft = Math.max(
    0,
    viewport.scrollWidth - viewport.clientWidth
  );
  const viewportRect = viewport.getBoundingClientRect();
  const isRtl = getViewportDirection(viewport) === "rtl";
  const snapPoints = slideElements
    .map((slideElement) => {
      const slideRect = slideElement.getBoundingClientRect();
      const relativeOffset = isRtl
        ? viewportRect.right - slideRect.right
        : slideRect.left - viewportRect.left;

      return {
        id: slideElement.id,
        position: clampLogicalScrollLeft(
          currentLogicalScrollLeft + relativeOffset,
          maxLogicalScrollLeft
        ),
      };
    })
    .sort((left, right) => left.position - right.position);

  return dedupeSnapPoints(snapPoints);
}

function getNearestSnapIndex(
  logicalScrollLeft: number,
  snapPositions: readonly number[]
) {
  if (!snapPositions.length) {
    return 0;
  }

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const [index, snapPosition] of snapPositions.entries()) {
    const distance = Math.abs(snapPosition - logicalScrollLeft);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }

  return nearestIndex;
}

function getViewportDirection(viewport: HTMLDivElement) {
  return (
    viewport.ownerDocument.defaultView?.getComputedStyle(viewport).direction ??
    "ltr"
  );
}
