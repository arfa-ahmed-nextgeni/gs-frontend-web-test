import { useEffect } from "react";

export function useMobileBottomSheetViewport({
  isMobile,
  open,
}: {
  isMobile: boolean;
  open: boolean;
}) {
  useEffect(() => {
    if (!isMobile || !open || typeof window === "undefined") return;

    const getContent = () =>
      document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;

    const reset = () => {
      const el = getContent();
      if (!el) return;
      el.style.bottom = "";
      el.style.maxHeight = "";
    };

    let rafId = 0;
    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = getContent();
        if (!el) return;
        const vv = window.visualViewport;
        if (!vv) {
          reset();
          return;
        }
        const diff = window.innerHeight - vv.height;
        if (diff > 100) {
          el.style.bottom = `${window.innerHeight - vv.height - vv.offsetTop}px`;
          el.style.maxHeight = `${vv.height}px`;
        } else {
          reset();
        }
      });
    };

    update();
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);

    return () => {
      cancelAnimationFrame(rafId);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      const el = getContent();
      if (el) {
        el.style.bottom = "";
        el.style.maxHeight = "";
      }
    };
  }, [isMobile, open]);
}
