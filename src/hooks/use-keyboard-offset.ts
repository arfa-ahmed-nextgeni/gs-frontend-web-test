import { useEffect, useRef, useState } from "react";

export type UseKeyboardOffsetResult = {
  isOpen: boolean;
  keyboardHeight: number; // px
  viewportHeight: number; // px (visualViewport.height || window.innerHeight)
};

export function useKeyboardOffset({
  focusDelay = 120,
  threshold = 80,
} = {}): UseKeyboardOffsetResult {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number>(
    typeof window !== "undefined"
      ? window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight
      : 0
  );

  const initialRef = useRef<null | number>(null);
  const rafRef = useRef<null | number>(null);
  const focusTimer = useRef<null | number>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getVH = () =>
      window.visualViewport ? window.visualViewport.height : window.innerHeight;

    // init baseline and viewport height
    initialRef.current = getVH();
    setViewportHeight(getVH());

    const measure = (vh: number) => {
      setViewportHeight(vh);
      if (initialRef.current == null) initialRef.current = vh;
      const diff = Math.max(0, (initialRef.current ?? vh) - vh);
      const open = diff > threshold;
      setIsOpen(open);
      setKeyboardHeight(open ? diff : 0);
    };

    const onVV = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        measure(getVH());
      });
    };

    const onResizeFallback = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        measure(getVH());
      });
    };

    const onFocusIn = () => {
      if (focusTimer.current) window.clearTimeout(focusTimer.current);
      focusTimer.current = window.setTimeout(() => {
        measure(getVH());
      }, focusDelay);
    };

    const onFocusOut = () => {
      if (focusTimer.current) window.clearTimeout(focusTimer.current);
      window.setTimeout(() => {
        const vh = getVH();
        // if viewport grew, update baseline so subsequent opens are measured vs new baseline
        if ((initialRef.current ?? 0) < vh) initialRef.current = vh;
        measure(vh);
      }, 150);
    };

    const onOrientation = () => {
      // rebase baseline after orientation settles
      setTimeout(() => {
        const vh = getVH();
        initialRef.current = vh;
        setViewportHeight(vh);
      }, 300);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onVV);
      window.visualViewport.addEventListener("scroll", onVV);
    } else {
      window.addEventListener("resize", onResizeFallback);
    }

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("orientationchange", onOrientation);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onVV);
        window.visualViewport.removeEventListener("scroll", onVV);
      } else {
        window.removeEventListener("resize", onResizeFallback);
      }
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("orientationchange", onOrientation);
      if (focusTimer.current) window.clearTimeout(focusTimer.current);
    };
  }, [threshold, focusDelay]);

  return { isOpen, keyboardHeight, viewportHeight };
}
