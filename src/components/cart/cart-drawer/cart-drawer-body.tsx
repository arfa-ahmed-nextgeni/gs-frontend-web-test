"use client";

import { PropsWithChildren, useLayoutEffect, useRef, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

export const CartDrawerBody = ({ children }: PropsWithChildren) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ height: 500, width: 500 });

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { height, width } = containerRef.current.getBoundingClientRect();
        setDimensions({ height, width });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div
      className="max-h-90 lg:mt-7.5 mt-5 min-h-0 flex-1 lg:max-h-none"
      ref={containerRef}
    >
      <ScrollArea
        className="[&>div>div]:!block [&>div>div]:!min-w-full"
        style={{
          height: `${dimensions.height}px`,
          width: `${dimensions.width}px`,
        }}
        type="hover"
      >
        {children}
      </ScrollArea>
    </div>
  );
};
