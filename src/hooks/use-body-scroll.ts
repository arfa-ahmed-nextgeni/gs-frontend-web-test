import { useEffect } from "react";

let activeLocks = 0;
let previousOverflow = "";
let previousPaddingRight = "";

export default function useBodyScroll(state: boolean) {
  useEffect(() => {
    if (!state) {
      return;
    }

    const { style } = document.body;

    if (activeLocks === 0) {
      previousOverflow = style.overflow;
      previousPaddingRight = style.paddingRight;

      const scrollWidth =
        window.innerWidth - document.documentElement.clientWidth;

      style.overflow = "hidden";
      style.paddingRight = scrollWidth > 0 ? `${scrollWidth}px` : "";
    }

    activeLocks += 1;

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);

      if (activeLocks === 0) {
        style.overflow = previousOverflow;
        style.paddingRight = previousPaddingRight;
      }
    };
  }, [state]);
}
