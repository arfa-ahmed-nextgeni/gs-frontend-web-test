"use client";

import { useEffect, useRef } from "react";

import { parseBannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";
import { usePathname } from "@/i18n/navigation";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { BANNER_TRACKING_DATA_ATTRIBUTE } from "@/lib/constants/tracking-data-attributes";

import type { BannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";

const BANNER_TRACKING_SELECTOR = `[${BANNER_TRACKING_DATA_ATTRIBUTE}]`;

export function BannerTrackingListener() {
  const pathname = usePathname();
  const visibleElementsRef = useRef(new WeakMap<Element, boolean>());

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    visibleElementsRef.current = new WeakMap<Element, boolean>();
    const bannerDataMap = new WeakMap<Element, BannerTrackingData>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const bannerData = bannerDataMap.get(entry.target);

          if (!bannerData) {
            return;
          }

          const wasVisible =
            visibleElementsRef.current.get(entry.target) ?? false;

          if (entry.isIntersecting && !wasVisible) {
            visibleElementsRef.current.set(entry.target, true);
            bannerTrackingManager.trackView(bannerData.elementId);
          }

          if (!entry.isIntersecting && wasVisible) {
            visibleElementsRef.current.set(entry.target, false);
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.5,
      }
    );

    document
      .querySelectorAll<HTMLElement>(BANNER_TRACKING_SELECTOR)
      .forEach((element) => {
        const bannerData = parseBannerTrackingData(
          element.getAttribute(BANNER_TRACKING_DATA_ATTRIBUTE)
        );

        if (!bannerData) {
          return;
        }

        bannerDataMap.set(element, bannerData);
        observer.observe(element);
      });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
