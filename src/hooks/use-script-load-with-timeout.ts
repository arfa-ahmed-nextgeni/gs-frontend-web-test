"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Tracks whether a third-party script (loaded via next/script) has finished
 * loading, with a timeout fallback: if `onLoad`/`onReady` hasn't fired within
 * `timeoutMs`, treats the script as loaded anyway rather than blocking the
 * UI forever on a slow/failed script load.
 */
export function useScriptLoadWithTimeout(timeoutMs = 8000) {
  const [isLoaded, setIsLoaded] = useState(false);

  const markLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(markLoaded, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoaded, markLoaded, timeoutMs]);

  return [isLoaded, markLoaded] as const;
}
