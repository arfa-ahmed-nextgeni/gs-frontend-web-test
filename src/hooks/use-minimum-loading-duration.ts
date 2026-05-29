import { useEffect, useRef, useState } from "react";

const DEFAULT_MINIMUM_VISIBLE_MS = 1000;

/**
 * Keeps a loading flag "on" for at least `minimumVisibleMs` once it turns on.
 *
 * A navigation/query that resolves from cache can finish within a few
 * milliseconds, which makes the skeleton flash on and off — a jarring,
 * half-played animation. Holding the flag for a minimum duration lets the
 * skeleton animation play through smoothly regardless of how fast the data
 * arrives. A slow load that already exceeds the minimum is unaffected.
 */
export function useMinimumLoadingDuration(
  isLoading: boolean,
  minimumVisibleMs: number = DEFAULT_MINIMUM_VISIBLE_MS
): boolean {
  const [isVisible, setIsVisible] = useState(isLoading);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (isLoading) {
      shownAtRef.current = Date.now();
      setIsVisible(true);
      return;
    }

    if (!isVisible) {
      return;
    }

    const remaining = minimumVisibleMs - (Date.now() - shownAtRef.current);

    if (remaining <= 0) {
      setIsVisible(false);
      return;
    }

    const timeoutId = setTimeout(() => setIsVisible(false), remaining);

    return () => clearTimeout(timeoutId);
  }, [isLoading, isVisible, minimumVisibleMs]);

  return isVisible;
}
