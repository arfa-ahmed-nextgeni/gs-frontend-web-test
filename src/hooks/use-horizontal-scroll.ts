import { useEffect, useRef } from "react";

const getWheelDelta = (event: WheelEvent, containerWidth: number) => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * containerWidth;
  }

  return event.deltaY;
};

export function useHorizontalScroll<T extends HTMLElement>() {
  const scrollRef = useRef<null | T>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) {
        return;
      }

      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
        return;
      }

      const previousScrollLeft = el.scrollLeft;
      const direction = getComputedStyle(el).direction;
      const directionMultiplier = direction === "rtl" ? -1 : 1;

      el.scrollLeft += getWheelDelta(e, el.clientWidth) * directionMultiplier;

      if (el.scrollLeft !== previousScrollLeft) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return scrollRef;
}
