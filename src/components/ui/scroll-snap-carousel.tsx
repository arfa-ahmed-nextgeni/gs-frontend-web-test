"use client";

import * as React from "react";

import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { cn } from "@/lib/utils";

export type ScrollSnapCarouselDotsProps = {
  className?: React.ComponentProps<"div">["className"];
  dotActiveClassName?: React.ComponentProps<"button">["className"];
  dotClassName?: React.ComponentProps<"button">["className"];
  visible?: boolean;
};

type ScrollSnapCarouselProps = React.PropsWithChildren<
  {
    canScrollNext: boolean;
    canScrollPrev: boolean;
    contentProps?: React.ComponentProps<"div">;
    dotIds?: string[];
    dotsProps?: ScrollSnapCarouselDotsProps;
    nextButtonProps?: React.ComponentProps<"button">;
    nextIconProps?: React.SVGAttributes<object>;
    onScrollNext: () => void;
    onScrollPrev: () => void;
    onScrollToIndex: (index: number) => void;
    previousButtonProps?: React.ComponentProps<"button">;
    previousIconProps?: React.SVGAttributes<object>;
    selectedIndex: number;
    slideIds: string[];
    viewportRef?: React.Ref<HTMLDivElement>;
  } & React.ComponentProps<"div">
>;

export function ScrollSnapCarousel({
  canScrollNext,
  canScrollPrev,
  children,
  className,
  contentProps,
  dotIds,
  dotsProps,
  nextButtonProps,
  nextIconProps,
  onKeyDownCapture,
  onScrollNext,
  onScrollPrev,
  onScrollToIndex,
  previousButtonProps,
  previousIconProps,
  selectedIndex,
  slideIds,
  viewportRef,
  ...props
}: ScrollSnapCarouselProps) {
  const { className: contentClassName, ...contentRestProps } =
    contentProps ?? {};
  const {
    className: nextButtonClassName,
    onClick: onNextButtonClick,
    ...nextButtonRestProps
  } = nextButtonProps ?? {};
  const { className: nextIconClassName, ...nextIconRestProps } =
    nextIconProps ?? {};
  const {
    className: previousButtonClassName,
    onClick: onPreviousButtonClick,
    ...previousButtonRestProps
  } = previousButtonProps ?? {};
  const { className: previousIconClassName, ...previousIconRestProps } =
    previousIconProps ?? {};
  const slides = React.Children.toArray(children);
  const resolvedDotIds = dotIds ?? slideIds;

  return (
    <div
      aria-roledescription="carousel"
      className={cn("relative w-full", className)}
      onKeyDownCapture={onKeyDownCapture}
      role="region"
      {...props}
    >
      <div
        className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-slot="scroll-snap-carousel-viewport"
        ref={viewportRef}
      >
        <div
          {...contentRestProps}
          className={cn("flex", contentClassName)}
          data-slot="scroll-snap-carousel-content"
        >
          {slides.map((slide, index) =>
            React.isValidElement<{ id?: string }>(slide)
              ? React.cloneElement(slide, {
                  id: slide.props.id ?? slideIds[index],
                })
              : slide
          )}
        </div>
      </div>

      {canScrollPrev ? (
        <button
          {...previousButtonRestProps}
          className={cn(
            "transition-default disabled:bg-btn-bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 absolute hidden items-center justify-center whitespace-nowrap rounded-md text-sm font-medium outline-none focus-visible:ring-[3px] disabled:pointer-events-none",
            "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            "size-auto lg:inline-flex",
            "start-0 top-1/2 -translate-y-1/2",
            previousButtonClassName
          )}
          data-slot="scroll-snap-carousel-previous"
          onClick={(event) => {
            onPreviousButtonClick?.(event);

            if (!event.defaultPrevented) {
              onScrollPrev();
            }
          }}
          type="button"
        >
          <ArrowLeftIcon
            {...previousIconRestProps}
            className={cn(
              "size-7.5 w-[15px] rtl:rotate-180",
              previousIconClassName
            )}
          />
          <span className="sr-only">Previous slide</span>
        </button>
      ) : null}

      {canScrollNext ? (
        <button
          {...nextButtonRestProps}
          className={cn(
            "transition-default disabled:bg-btn-bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 absolute hidden items-center justify-center whitespace-nowrap rounded-md text-sm font-medium outline-none focus-visible:ring-[3px] disabled:pointer-events-none",
            "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            "size-auto lg:inline-flex",
            "end-0 top-1/2 -translate-y-1/2",
            nextButtonClassName
          )}
          data-slot="scroll-snap-carousel-next"
          onClick={(event) => {
            onNextButtonClick?.(event);

            if (!event.defaultPrevented) {
              onScrollNext();
            }
          }}
          type="button"
        >
          <ArrowRightIcon
            {...nextIconRestProps}
            className={cn(
              "size-7.5 w-[15px] rtl:rotate-180",
              nextIconClassName
            )}
          />
          <span className="sr-only">Next slide</span>
        </button>
      ) : null}

      {dotsProps?.visible ? (
        <div
          className={cn(
            "absolute bottom-2.5 flex w-full flex-row items-center justify-center",
            dotsProps.className
          )}
          role="tablist"
        >
          {resolvedDotIds.map((dotId, index) => (
            <button
              aria-controls={dotId}
              aria-label={`Slide ${index + 1}`}
              aria-selected={index === selectedIndex}
              className={cn(
                "after:transition-default flex size-6 cursor-pointer items-center justify-center after:block after:size-1.5 after:rounded-full",
                "after:bg-bg-default after:opacity-60",
                dotsProps.dotClassName,
                index === selectedIndex &&
                  cn(
                    "after:bg-bg-primary after:opacity-100",
                    dotsProps.dotActiveClassName
                  )
              )}
              data-slot="scroll-snap-carousel-dot"
              key={dotId}
              onClick={() => onScrollToIndex(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ScrollSnapCarouselItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 snap-start [scroll-snap-stop:always]",
        className
      )}
      data-slot="scroll-snap-carousel-item"
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}
