import { useEffect, useRef } from "react";

import {
  getScrollOffsetFromStart,
  scrollToOffsetFromStart,
} from "@/lib/utils/rtl-scroll";

const getWheelDelta = (event: WheelEvent, containerWidth: number) => {
  if (event.deltaMode === 1) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * containerWidth;
  }

  return event.deltaY;
};

const clampScrollOffset = (offset: number, maxOffset: number) =>
  Math.max(0, Math.min(offset, maxOffset));

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

      const maxScrollOffset = el.scrollWidth - el.clientWidth;
      const currentOffset = getScrollOffsetFromStart(el);
      const nextOffset = clampScrollOffset(
        currentOffset + getWheelDelta(e, el.clientWidth),
        maxScrollOffset
      );

      if (nextOffset === currentOffset) {
        return;
      }

      e.preventDefault();
      scrollToOffsetFromStart(el, nextOffset, { behavior: "auto" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return scrollRef;
}
