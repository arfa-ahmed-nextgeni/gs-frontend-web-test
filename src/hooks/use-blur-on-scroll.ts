"use client";

import { useEffect } from "react";

import { useWindowFocusWithin } from "@/hooks/use-window-focus-within";

export function useBlurOnScroll() {
  const isFocusWithin = useWindowFocusWithin();

  useEffect(() => {
    if (!isFocusWithin) {
      return;
    }

    const handleTouchMove = () => {
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        active.blur();
      }
    };

    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isFocusWithin]);
}
