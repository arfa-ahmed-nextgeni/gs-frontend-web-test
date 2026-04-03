import { useEffect, useRef, useState } from "react";

type ObserverEntry = {
  listenerMap: WeakMap<Element, Set<VisibilityListener>>;
  observer: IntersectionObserver;
};

type VisibilityListener = () => void;

const visibleTargets = new WeakSet<Element>();
const observerRegistry = new Map<string, ObserverEntry>();

const getObserverKey = (rootMargin: string, threshold: number) =>
  `${rootMargin}|${threshold}`;

const getObserverEntry = (
  rootMargin: string,
  threshold: number
): ObserverEntry => {
  const key = getObserverKey(rootMargin, threshold);
  const existingEntry = observerRegistry.get(key);

  if (existingEntry) {
    return existingEntry;
  }

  const listenerMap = new WeakMap<Element, Set<VisibilityListener>>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const listeners = listenerMap.get(entry.target);

        if (!listeners?.size) {
          continue;
        }

        visibleTargets.add(entry.target);
        listeners.forEach((listener) => listener());
        listenerMap.delete(entry.target);
        observer.unobserve(entry.target);
      }
    },
    {
      rootMargin,
      threshold,
    }
  );

  const observerEntry = {
    listenerMap,
    observer,
  };

  observerRegistry.set(key, observerEntry);

  return observerEntry;
};

export const useVisibilityLoad = <T extends HTMLElement>({
  disabled = false,
  resolveTarget,
  rootMargin = "0px",
  threshold = 0.1,
}: {
  disabled?: boolean;
  resolveTarget?: (element: T) => Element | null;
  rootMargin?: string;
  threshold?: number;
} = {}) => {
  const sentinelRef = useRef<T>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (disabled || shouldLoad || !sentinelRef.current) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const target = resolveTarget?.(sentinelRef.current) ?? sentinelRef.current;

    if (visibleTargets.has(target)) {
      setShouldLoad(true);
      return;
    }

    const { listenerMap, observer } = getObserverEntry(rootMargin, threshold);
    const loadTarget = () => {
      setShouldLoad(true);
    };
    const listeners = listenerMap.get(target) ?? new Set<VisibilityListener>();
    const shouldObserveTarget = listeners.size === 0;

    listeners.add(loadTarget);
    listenerMap.set(target, listeners);

    if (shouldObserveTarget) {
      observer.observe(target);
    }

    return () => {
      const targetListeners = listenerMap.get(target);

      if (!targetListeners) {
        return;
      }

      targetListeners.delete(loadTarget);

      if (targetListeners.size > 0) {
        return;
      }

      listenerMap.delete(target);
      observer.unobserve(target);
    };
  }, [disabled, resolveTarget, rootMargin, shouldLoad, threshold]);

  return {
    sentinelRef,
    shouldLoad,
  };
};
