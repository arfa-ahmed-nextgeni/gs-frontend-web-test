"use client";

import type { PropsWithChildren } from "react";

import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";

interface HomeCategoriesScrollContainerProps extends PropsWithChildren {
  className: string;
}

export function HomeCategoriesScrollContainer({
  children,
  className,
}: HomeCategoriesScrollContainerProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <div className={className} ref={scrollRef}>
      {children}
    </div>
  );
}
