import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon";
import { CarouselContent } from "@/components/ui/carousel/carousel-content";
import { CarouselDots } from "@/components/ui/carousel/carousel-dots";
import { CarouselNextButton } from "@/components/ui/carousel/carousel-next-button";
import { CarouselPreviousButton } from "@/components/ui/carousel/carousel-previous-button";
import { Carousel } from "@/components/ui/carousel/index";
import { cn } from "@/lib/utils";

export function CarouselContainer({
  carouselProps,
  children,
  contentProps,
  dotsProps,
  nextButtonProps,
  nextIconProps,
  previousButtonProps,
  previousIconProps,
}: React.PropsWithChildren<{
  carouselProps?: React.ComponentProps<typeof Carousel>;
  contentProps?: React.ComponentProps<typeof CarouselContent>;
  dotsProps?: React.ComponentProps<typeof CarouselDots>;
  nextButtonProps?: React.ComponentProps<typeof CarouselNextButton>;
  nextIconProps?: React.SVGAttributes<object>;
  previousButtonProps?: React.ComponentProps<typeof CarouselPreviousButton>;
  previousIconProps?: React.SVGAttributes<object>;
}>) {
  return (
    <Carousel
      {...carouselProps}
      className={cn("w-full", carouselProps?.className)}
      opts={{
        align: "start",
        ...carouselProps?.opts,
      }}
    >
      <CarouselContent {...contentProps}>{children}</CarouselContent>
      <CarouselPreviousButton {...previousButtonProps}>
        <ArrowLeftIcon
          {...previousIconProps}
          className={cn(
            "size-7.5 w-[15px] rtl:rotate-180",
            previousIconProps?.className
          )}
        />
        <span className="sr-only">Previous slide</span>
      </CarouselPreviousButton>
      <CarouselNextButton {...nextButtonProps}>
        <ArrowRightIcon
          {...nextIconProps}
          className={cn(
            "size-7.5 w-[15px] rtl:rotate-180",
            nextIconProps?.className
          )}
        />
        <span className="sr-only">Next slide</span>
      </CarouselNextButton>
      <CarouselDots {...dotsProps} />
    </Carousel>
  );
}
