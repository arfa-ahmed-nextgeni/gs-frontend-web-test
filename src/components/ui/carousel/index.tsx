"use client";

import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel";
import type { UseEmblaCarouselType } from "embla-carousel-react";

import * as React from "react";

import { useDirection } from "@radix-ui/react-direction";
import useEmblaCarousel from "embla-carousel-react";

import { DEFERRED_CAROUSEL_ROOT_MARGIN } from "@/lib/constants/carousel";
import { CarouselHandle } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

type CarouselApi = EmblaCarouselType;
type CarouselCompatOptions = {
  breakpoints?: Record<string, CarouselCompatOptions>;
  draggable?: boolean;
  focus?: boolean;
  resize?: boolean;
  slideChanges?: boolean;
  startIndex?: number;
  watchDrag?: boolean;
  watchFocus?: boolean;
  watchResize?: boolean;
  watchSlides?: boolean;
} & EmblaOptionsType;
type CarouselContextProps = {
  api: CarouselApi | undefined;
  canScrollNext: boolean;
  canScrollPrev: boolean;
  carouselRef: UseEmblaCarouselType[0];
  containerId: string;
  scrollNext: () => void;
  scrollPrev: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
  snapList: () => number[];
} & CarouselProps;
type CarouselDeferredActivation = {
  rootMargin?: string;
};
type CarouselOptions = CarouselCompatOptions;

type CarouselProps = {
  apiRef?: React.Ref<CarouselHandle>;
  autoPlay?: {
    delay?: number;
    enabled?: boolean;
  };
  deferUntilInView?: boolean | CarouselDeferredActivation;
  onIndexChange?: (index: number) => void;
  opts?: CarouselOptions;
  orientation?: "horizontal" | "vertical";
  plugins?: EmblaPluginType[];
  setApi?: (api: CarouselApi) => void;
};
type NormalizedEmblaOptions = EmblaOptionsType;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function canMoveToNext(api: CarouselApi) {
  return api.canGoToNext();
}

function canMoveToPrev(api: CarouselApi) {
  return api.canGoToPrev();
}

function Carousel({
  apiRef,
  autoPlay,
  children,
  className,
  deferUntilInView,
  onIndexChange,
  opts,
  orientation = "horizontal",
  plugins,
  setApi,
  ...props
}: CarouselProps & React.ComponentProps<"div">) {
  const direction = useDirection();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reactId = React.useId();
  const containerId = React.useMemo(
    () => `carousel-${reactId.replaceAll(":", "")}`,
    [reactId]
  );
  const shouldDeferUntilInView = Boolean(deferUntilInView);
  const deferRootMargin =
    typeof deferUntilInView === "object"
      ? (deferUntilInView.rootMargin ?? DEFERRED_CAROUSEL_ROOT_MARGIN)
      : DEFERRED_CAROUSEL_ROOT_MARGIN;
  const [isEmblaActive, setIsEmblaActive] = React.useState(
    !shouldDeferUntilInView
  );
  const baseOpts = React.useMemo<NormalizedEmblaOptions>(
    () => ({
      ...normalizeCarouselOptions(opts),
    }),
    [opts]
  );
  const normalizedOpts = React.useMemo<NormalizedEmblaOptions>(
    () => ({
      ...baseOpts,
      active:
        (baseOpts?.active ?? true) &&
        (!shouldDeferUntilInView || isEmblaActive),
      axis: orientation === "horizontal" ? ("x" as const) : ("y" as const),
      direction: direction === "rtl" ? ("rtl" as const) : ("ltr" as const),
    }),
    [baseOpts, direction, isEmblaActive, orientation, shouldDeferUntilInView]
  );
  const autoplayEnabled = Boolean(autoPlay?.enabled);
  const autoplayDelay = autoPlay?.delay || 3000;
  const carouselPlugins = React.useMemo<EmblaPluginType[]>(
    () => [...(plugins ?? [])],
    [plugins]
  );
  const [carouselRef, api, serverApi] = useEmblaCarousel(
    normalizedOpts,
    carouselPlugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(
    normalizedOpts?.startSnap || 0
  );
  const shouldRenderSsrStyles = React.useMemo(
    () => !api && hasSsrConfiguration(opts),
    [api, opts]
  );
  const ssrStyles = React.useMemo(
    () =>
      shouldRenderSsrStyles
        ? serverApi.ssrStyles(`#${containerId}`, `[data-slot='carousel-item']`)
        : "",
    [containerId, serverApi, shouldRenderSsrStyles]
  );

  const onSelect = React.useCallback(
    (emblaApi: CarouselApi) => {
      setCanScrollPrev(canMoveToPrev(emblaApi));
      setCanScrollNext(canMoveToNext(emblaApi));
      setSelectedIndex(getSelectedSnap(emblaApi));
      onIndexChange?.(getSelectedSnap(emblaApi));
    },
    [onIndexChange]
  );

  const scrollPrev = React.useCallback(() => {
    if (!api) return;
    moveToPrev(api);
  }, [api]);

  const scrollNext = React.useCallback(() => {
    if (!api) return;
    moveToNext(api);
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      if (!api || index === getSelectedSnap(api)) return;
      moveTo(api, index);
    },
    [api]
  );

  React.useImperativeHandle(apiRef, () => ({
    scrollNext,
    scrollPrev,
    scrollTo,
    selectedIndex,
  }));

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!shouldDeferUntilInView || isEmblaActive) {
      return;
    }

    const rootElement = rootRef.current;

    if (!rootElement) {
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      setIsEmblaActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setIsEmblaActive(true);
        observer.disconnect();
      },
      {
        rootMargin: deferRootMargin,
      }
    );

    observer.observe(rootElement);

    return () => {
      observer.disconnect();
    };
  }, [deferRootMargin, isEmblaActive, shouldDeferUntilInView]);

  React.useEffect(() => {
    if (!api || !autoplayEnabled) return;

    const ownerDocument = api.rootNode().ownerDocument;
    const ownerWindow = ownerDocument.defaultView;

    if (!ownerWindow) return;

    let timerId: null | number = null;
    let isPointerDown = false;

    const clearAutoplayTimer = () => {
      if (timerId === null) return;

      ownerWindow.clearTimeout(timerId);
      timerId = null;
    };

    const scheduleAutoplay = () => {
      clearAutoplayTimer();

      if (ownerDocument.visibilityState === "hidden") return;
      if (isPointerDown) return;
      if (api.snapList().length <= 1) return;

      timerId = ownerWindow.setTimeout(() => {
        if (api.canGoToNext()) {
          api.goToNext();
        } else {
          api.goTo(0);
        }
      }, autoplayDelay);
    };

    const handlePointerDown = () => {
      isPointerDown = true;
      clearAutoplayTimer();
    };

    const handlePointerUp = () => {
      isPointerDown = false;
      scheduleAutoplay();
    };

    const handleVisibilityChange = () => {
      scheduleAutoplay();
    };

    api.on("reinit", scheduleAutoplay);
    api.on("select", scheduleAutoplay);
    api.on("pointerdown", handlePointerDown);
    api.on("pointerup", handlePointerUp);
    ownerDocument.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleAutoplay();

    return () => {
      clearAutoplayTimer();
      api.off("reinit", scheduleAutoplay);
      api.off("select", scheduleAutoplay);
      api.off("pointerdown", handlePointerDown);
      api.off("pointerup", handlePointerUp);
      ownerDocument.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [api, autoplayDelay, autoplayEnabled]);

  React.useEffect(() => {
    if (!api) return;
    const reinitEvent = getReinitEventName();

    onSelect(api);
    api.on(reinitEvent, onSelect);
    api.on("select", onSelect);

    return () => {
      api.off(reinitEvent, onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        containerId,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollNext,
        scrollPrev,
        scrollTo,
        selectedIndex,
        snapList: () => (api ? getSnapList(api) : []),
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn("relative", className)}
        data-slot="carousel"
        onKeyDownCapture={handleKeyDown}
        ref={rootRef}
        role="region"
        {...props}
      >
        {ssrStyles ? <style>{ssrStyles}</style> : null}
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function getReinitEventName() {
  return "reinit" as const;
}

function getSelectedSnap(api: CarouselApi) {
  return api.selectedSnap();
}

function getSnapList(api: CarouselApi) {
  return api.snapList();
}

function hasSsrConfiguration(options?: Partial<CarouselOptions>): boolean {
  if (!options) return false;
  if (Array.isArray(options.ssr) && options.ssr.length > 0) return true;

  return Object.values(options.breakpoints ?? {}).some((breakpointOptions) =>
    hasSsrConfiguration(breakpointOptions as Partial<CarouselOptions>)
  );
}

function moveTo(api: CarouselApi, index: number) {
  api.goTo(index);
}

function moveToNext(api: CarouselApi) {
  api.goToNext();
}

function moveToPrev(api: CarouselApi) {
  api.goToPrev();
}

function normalizeCarouselOptions(
  options?: Partial<CarouselOptions>
): NormalizedEmblaOptions | undefined {
  if (!options) return undefined;

  const {
    breakpoints,
    draggable,
    focus,
    resize,
    slideChanges,
    startIndex,
    startSnap,
    watchDrag,
    watchFocus,
    watchResize,
    watchSlides,
    ...rest
  } = options;

  const normalizedBreakpoints = breakpoints
    ? Object.fromEntries(
        Object.entries(breakpoints).map(([query, breakpointOptions]) => [
          query,
          normalizeCarouselOptions(
            breakpointOptions as Partial<CarouselOptions>
          ) || {},
        ])
      )
    : undefined;

  return {
    ...rest,
    ...(normalizedBreakpoints ? { breakpoints: normalizedBreakpoints } : {}),
    ...(draggable !== undefined || watchDrag !== undefined
      ? { draggable: draggable ?? watchDrag }
      : {}),
    ...(focus !== undefined || watchFocus !== undefined
      ? { focus: focus ?? watchFocus }
      : {}),
    ...(resize !== undefined || watchResize !== undefined
      ? { resize: resize ?? watchResize }
      : {}),
    ...(slideChanges !== undefined || watchSlides !== undefined
      ? { slideChanges: slideChanges ?? watchSlides }
      : {}),
    ...(startSnap !== undefined || startIndex !== undefined
      ? { startSnap: startSnap ?? startIndex }
      : {}),
  };
}

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

export { Carousel, type CarouselApi, useCarousel };
