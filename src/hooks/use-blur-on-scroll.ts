"use client";

import { useEffect } from "react";

export function useBlurOnScroll() {
  useEffect(() => {
    const handleTouchMove = () => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        active.blur();
      }
    };

    const handleFocusIn = () => {
      window.addEventListener("touchmove", handleTouchMove);
    };

    const handleFocusOut = () => {
      window.removeEventListener("touchmove", handleTouchMove);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
}
