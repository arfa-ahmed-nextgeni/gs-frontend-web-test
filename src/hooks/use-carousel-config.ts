import React, { useMemo } from "react";

import useWindowSize from "@/hooks/use-window-size";

const useCarouselConfig = (variant?: string) => {
  const { width } = useWindowSize();

  // Memoize spaceBetween based on variant and width
  const spaceBetween = React.useMemo(() => {
    if (variant === "outBorder") {
      return 10;
    }
    if (variant === "outBorder-xl") {
      return width! < 1536 ? 10 : 20;
    }
    return 6; // Default value
  }, [variant, width]);

  const breakpoints = useMemo(() => {
    switch (variant) {
      case "outBorder-xl":
        return {
          0: { slidesPerView: 1 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
          1536: { slidesPerView: 7 },
          360: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
        };

      default:
        return {
          0: { slidesPerView: 1 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
          1536: { slidesPerView: 6 },
          360: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
        };
    }
  }, [variant]);

  return { breakpoints, spaceBetween };
};

export default useCarouselConfig;
