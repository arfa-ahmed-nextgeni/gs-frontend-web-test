import { useEffect, useRef, useState } from "react";

export function useIsScrolling(idleMs = 200) {
  const [isScrolling, setIsScrolling] = useState(false);
  const rafRef = useRef<null | number>(null);
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      if (!isScrolling) setIsScrolling(true);

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        timeoutRef.current = null;
      }, idleMs);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleMs]); // don't include isScrolling in deps — we only call setIsScrolling

  return isScrolling;
}
