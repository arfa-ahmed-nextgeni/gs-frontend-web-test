"use client";

import * as React from "react";

import { useDirection } from "@radix-ui/react-direction";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";

import { CarouselHandle } from "@/lib/types/ui-types";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];

type CarouselContextProps = {
  api: ReturnType<typeof useEmblaCarousel>[1];
  canScrollNext: boolean;
  canScrollPrev: boolean;
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  scrollNext: () => void;
  scrollPrev: () => void;
  scrollTo: (index: number) => void;
  selectedIndex: number;
} & CarouselProps;

type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  apiRef?: React.Ref<CarouselHandle>;
  autoPlay?: {
    delay?: number;
    enabled?: boolean;
  };
  onIndexChange?: (index: number) => void;
  opts?: CarouselOptions;
  orientation?: "horizontal" | "vertical";
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
};

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function Carousel({
  apiRef,
  autoPlay,
  children,
  className,
  onIndexChange,
  opts,
  orientation = "horizontal",
  setApi,
  ...props
}: CarouselProps & React.ComponentProps<"div">) {
  const direction = useDirection();

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
      direction,
    },
    autoPlay?.enabled
      ? [
          Autoplay({
            delay: autoPlay.delay || 3000,
            playOnInit: true,
            stopOnInteraction: false,
          }),
        ]
      : []
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(
    opts?.startIndex || 0
  );

  const onSelect = React.useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      onIndexChange?.(api.selectedScrollSnap());
    },
    [onIndexChange]
  );

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      if (index === api?.selectedScrollSnap()) return;
      api?.scrollTo(index);
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
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        api,
        canScrollNext,
        canScrollPrev,
        carouselRef,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollNext,
        scrollPrev,
        scrollTo,
        selectedIndex,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn("relative", className)}
        data-slot="carousel"
        onKeyDownCapture={handleKeyDown}
        role="region"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

export { Carousel, type CarouselApi, useCarousel };
