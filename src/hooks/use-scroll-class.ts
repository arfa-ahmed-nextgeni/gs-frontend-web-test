import { RefObject, useEffect } from "react";

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

    const target: EventTarget =
      scroller === window ? window : (scroller as HTMLElement);
    target.addEventListener("scroll", readScrollAndUpdate, { passive: true });
    // also update on resize because layout change may affect threshold
    window.addEventListener("resize", readScrollAndUpdate, { passive: true });

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      target.removeEventListener("scroll", readScrollAndUpdate);
      window.removeEventListener("resize", readScrollAndUpdate);
    };
  }, [ref, topOffset, scrollContainer]);
}
