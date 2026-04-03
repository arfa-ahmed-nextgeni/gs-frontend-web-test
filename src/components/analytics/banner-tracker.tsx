"use client";

import { ComponentProps, useEffect, useEffectEvent, useRef } from "react";

import { Link } from "@/i18n/navigation";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";

/**
 * Banner Tracker Anchor Component
 * Extends anchor tag with banner tracking functionality
 * Use this instead of <a> when you need to track banner views and clicks
 * Eliminates the need for an extra wrapper div
 */
export function BannerTrackerAnchor({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  children,
  elementId,
  extra,
  onVisible,
  ...anchorProps
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  children: React.ReactNode;
  elementId?: string;
  extra?: Record<string, unknown>;
  onVisible?: () => void;
} & ComponentProps<"a">) {
  const { setElementRef } = useBannerTracking(elementId, onVisible);

  // Handle click tracking and call original onClick if provided
  const handleClickWithTracking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (elementId) {
      bannerTrackingManager.trackClick(elementId, {
        innerPosition: bannerInnerPosition,
        lpId: bannerLpId,
        origin: bannerOrigin,
        style: bannerStyle,
        type: bannerType,
      });

      // Track LP click origin if row and column are provided
      if (
        bannerOrigin === "lp" &&
        bannerRow !== undefined &&
        bannerColumn !== undefined
      ) {
        clickOriginTrackingManager.setClickOrigin({
          column: bannerColumn,
          extra,
          inner_position: bannerInnerPosition,
          origin: "lp",
          row: bannerRow,
        });
      }
    }
    anchorProps.onClick?.(e);
  };

  return (
    <a {...anchorProps} onClick={handleClickWithTracking} ref={setElementRef}>
      {children}
    </a>
  );
}

/**
 * Banner Tracker Link Component
 * Extends Link component with banner tracking functionality
 * Use this instead of Link when you need to track banner views and clicks
 * If elementId is not provided, it behaves exactly like a regular Link (no tracking overhead)
 * Eliminates the need for an extra wrapper div or conditional logic
 */
export function BannerTrackerLink({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  children,
  elementId,
  extra,
  onVisible,
  ...linkProps
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  children: React.ReactNode;
  elementId?: string;
  extra?: Record<string, unknown>;
  onVisible?: () => void;
} & ComponentProps<typeof Link>) {
  // Conditionally render with or without tracking
  if (elementId) {
    return (
      <BannerTrackerLinkInternal
        bannerColumn={bannerColumn}
        bannerInnerPosition={bannerInnerPosition}
        bannerLpId={bannerLpId}
        bannerOrigin={bannerOrigin}
        bannerRow={bannerRow}
        bannerStyle={bannerStyle}
        bannerType={bannerType}
        elementId={elementId}
        extra={extra}
        onVisible={onVisible}
        {...linkProps}
      >
        {children}
      </BannerTrackerLinkInternal>
    );
  }

  return (
    <Link {...linkProps} prefetch={false}>
      {children}
    </Link>
  );
}

/**
 * Banner Tracker Link Component (Internal)
 * Extends Link component with banner tracking functionality
 * Always tracks when elementId is provided
 */
function BannerTrackerLinkInternal({
  bannerColumn,
  bannerInnerPosition,
  bannerLpId,
  bannerOrigin,
  bannerRow,
  bannerStyle,
  bannerType,
  children,
  elementId,
  extra,
  onVisible,
  ...linkProps
}: {
  bannerColumn?: number;
  bannerInnerPosition?: number;
  bannerLpId?: string;
  bannerOrigin?: "lp" | "pdp" | "plp";
  bannerRow?: number;
  bannerStyle?: "grid" | "horizontal" | "list" | "paged";
  bannerType?: "banner-slider" | "banner" | "banners-in-grid";
  children: React.ReactNode;
  elementId: string;
  extra?: Record<string, unknown>;
  onVisible?: () => void;
} & ComponentProps<typeof Link>) {
  const { setElementRef } = useBannerTracking(elementId, onVisible);

  // Handle click tracking and call original onClick if provided
  const handleClickWithTracking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    bannerTrackingManager.trackClick(elementId, {
      innerPosition: bannerInnerPosition,
      lpId: bannerLpId,
      origin: bannerOrigin,
      style: bannerStyle,
      type: bannerType,
    });

    // Track LP click origin if row and column are provided
    if (
      bannerOrigin === "lp" &&
      bannerRow !== undefined &&
      bannerColumn !== undefined
    ) {
      clickOriginTrackingManager.setClickOrigin({
        column: bannerColumn,
        extra,
        inner_position: bannerInnerPosition,
        origin: "lp",
        row: bannerRow,
      });
    }

    linkProps.onClick?.(e);
  };

  return (
    <Link
      {...linkProps}
      onClick={handleClickWithTracking}
      prefetch={false}
      ref={setElementRef}
    >
      {children}
    </Link>
  );
}

/**
 * Shared hook for banner tracking logic
 */
function useBannerTracking(
  elementId: string | undefined,
  onVisible?: () => void
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const isCurrentlyVisible = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use useEffectEvent to make onVisible non-reactive
  // This prevents the effect from re-running when onVisible changes
  // while still accessing the latest callback when invoked
  const onVisibleEvent = useEffectEvent(() => {
    onVisible?.();
  });

  // Callback ref to get the element
  const setElementRef = (element: HTMLElement | null) => {
    elementRef.current = element;
  };

  useEffect(() => {
    // Skip if no elementId or element not available
    if (!elementId || !elementRef.current) return;

    const element = elementRef.current;

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Track view when banner becomes visible (enters viewport)
          if (entry.isIntersecting && !isCurrentlyVisible.current) {
            isCurrentlyVisible.current = true;
            bannerTrackingManager.trackView(elementId);
            onVisibleEvent();
          }

          // Reset when banner leaves viewport
          // This allows tracking multiple views if user scrolls back
          if (!entry.isIntersecting && isCurrentlyVisible.current) {
            isCurrentlyVisible.current = false;
          }
        });
      },
      {
        // Trigger when banner is within 100px of viewport
        rootMargin: "100px",
        // Trigger when at least 50% of the banner is visible
        threshold: 0.5,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        observerRef.current.disconnect();
      }
    };
  }, [elementId]);

  return {
    setElementRef,
  };
}
