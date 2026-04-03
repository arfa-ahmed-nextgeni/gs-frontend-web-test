"use client";

import { useEffect, useState } from "react";

export function useIdleLoad(enabled: boolean) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setShouldLoad(false);
      return;
    }

    if (shouldLoad) {
      return;
    }

    const markReady = () => {
      setShouldLoad(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(markReady);

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(markReady, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, shouldLoad]);

  return shouldLoad;
}
