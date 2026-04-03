import { useEffect, useRef } from "react";

export const useScrollToTop = (dependency: unknown) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        behavior: "smooth",
        top: 0,
      });
    }
  }, [dependency]);

  return scrollContainerRef;
};
