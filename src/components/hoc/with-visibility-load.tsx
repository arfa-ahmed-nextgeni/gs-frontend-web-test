import { type ComponentType, lazy, type ReactNode } from "react";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { useVisibilityLoad } from "@/hooks/use-visibility-load";

type VisibilityFallbackProps<P, T extends HTMLElement> = {
  props: P;
  sentinelRef?: React.RefObject<null | T>;
  shouldLoad: boolean;
};

export const withVisibilityLoad = <
  P extends object,
  T extends HTMLElement = HTMLSpanElement,
>({
  displayName,
  loader,
  renderFallback,
  resolveTarget,
  rootMargin = "0px",
  threshold = 0.1,
}: {
  displayName: string;
  loader: () => Promise<{ default: ComponentType<P> }>;
  renderFallback?: (args: VisibilityFallbackProps<P, T>) => ReactNode;
  resolveTarget?: (element: T) => Element | null;
  rootMargin?: string;
  threshold?: number;
}) => {
  const LazyComponent = lazy(loader) as ComponentType<P>;

  const VisibilityLoadedComponent = (props: P) => {
    const { sentinelRef, shouldLoad } = useVisibilityLoad<T>({
      resolveTarget,
      rootMargin,
      threshold,
    });
    const fallback = renderFallback?.({
      props,
      sentinelRef: shouldLoad ? undefined : sentinelRef,
      shouldLoad,
    });

    if (!shouldLoad) {
      return fallback ?? <span aria-hidden ref={sentinelRef} />;
    }

    return (
      <AsyncBoundary loadingFallback={fallback}>
        <LazyComponent {...props} />
      </AsyncBoundary>
    );
  };

  VisibilityLoadedComponent.displayName = displayName;

  return VisibilityLoadedComponent;
};
