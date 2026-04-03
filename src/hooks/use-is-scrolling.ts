import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  getServerWindowLastScrollAt,
  getWindowLastScrollAt,
  subscribeWindowScroll,
} from "@/lib/stores/window-scroll-store";

export function useIsScrolling(idleMs = 200) {
  const [isScrolling, setIsScrolling] = useState(false);
  const hasSyncedInitialScrollRef = useRef(false);
  const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const lastScrollAt = useSyncExternalStore(
    subscribeWindowScroll,
    getWindowLastScrollAt,
    getServerWindowLastScrollAt
  );

  useEffect(() => {
    if (!hasSyncedInitialScrollRef.current) {
      hasSyncedInitialScrollRef.current = true;
      return;
    }

    setIsScrolling(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      timeoutRef.current = null;
    }, idleMs);
  }, [idleMs, lastScrollAt]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return isScrolling;
}
