import { RefObject, useEffect } from "react";

import { subscribeWindowScroll } from "@/lib/stores/window-scroll-store";
import { subscribeWindowSize } from "@/lib/stores/window-size-store";

/**
 * Immediately toggles `.is-scrolling` on the element referenced by `ref`
 * based on scroll position (window or optional scroll container).
 *
 * - topOffset: toggles when scrollY > topOffset
 * - scrollContainer: optional; defaults to window
 */
export function useScrollClass<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  topOffset = 80,
  scrollContainer?: HTMLElement | null | Window
) {
  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const scroller = scrollContainer ?? window;
    let rafId: null | number = null;

    const readScrollAndUpdate = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollY =
          scroller === window
            ? window.scrollY || window.pageYOffset || 0
            : (scroller as HTMLElement).scrollTop;

        if (scrollY > topOffset) {
          element.classList.add("is-scrolling");
        } else {
          element.classList.remove("is-scrolling");
        }
      });
    };

    // run once immediately to ensure initial class state matches current scroll
    readScrollAndUpdate();

    const cleanupScrollListener =
      scroller === window
        ? subscribeWindowScroll(readScrollAndUpdate)
        : subscribeElementScroll(scroller as HTMLElement, readScrollAndUpdate);
    const cleanupResizeListener = subscribeWindowSize(readScrollAndUpdate);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      cleanupScrollListener();
      cleanupResizeListener();
    };
  }, [ref, topOffset, scrollContainer]);
}

function subscribeElementScroll(element: HTMLElement, listener: () => void) {
  element.addEventListener("scroll", listener, { passive: true });

  return () => {
    element.removeEventListener("scroll", listener);
  };
}
