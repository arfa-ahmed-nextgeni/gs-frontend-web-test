"use client";

import { useEffect, useEffectEvent } from "react";

import { setBannerClickOrigin } from "@/components/analytics/utils/banner-click-origin";
import { parseBannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";
import { parseHomeCategoryClickOrigin } from "@/components/category/utils/home-category-click-origin-dataset";
import { setSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin";
import { parseSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin-dataset";
import { setProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin";
import { parseProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin-dataset";
import { getCurrentDesktopNavigationLpId } from "@/layouts/header/desktop-navigation/desktop-navigation-click-origin";
import { parseDesktopNavigationTrackingPayload } from "@/layouts/header/desktop-navigation/desktop-navigation-tracking-dataset";
import { getCurrentLpId } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin";
import { parseMobileNavigationClickOriginPayload } from "@/layouts/header/mobile-navigation/mobile-navigation-click-origin-dataset";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import { clickOriginTrackingManager } from "@/lib/analytics/click-origin-tracking-manager";
import {
  trackCsCall,
  trackCsEmail,
  trackCsWhatsapp,
  trackDesktopNavigation,
  trackFaqPageOpen,
  trackMenuClick,
} from "@/lib/analytics/events";
import {
  BANNER_TRACKING_DATA_ATTRIBUTE,
  CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE,
  DESKTOP_NAVIGATION_TRACKING_DATA_ATTRIBUTE,
  FAQ_TRACKING_DATA_ATTRIBUTE,
  HOME_CATEGORY_CLICK_ORIGIN_DATA_ATTRIBUTE,
  MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE,
  MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE,
  PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE,
  SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE,
} from "@/lib/constants/tracking-data-attributes";

const BANNER_TRACKING_SELECTOR = `[${BANNER_TRACKING_DATA_ATTRIBUTE}]`;
const CUSTOMER_SERVICE_TRACKING_SELECTOR = `[${CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE}]`;
const DESKTOP_NAVIGATION_TRACKING_SELECTOR = `[${DESKTOP_NAVIGATION_TRACKING_DATA_ATTRIBUTE}]`;
const FAQ_TRACKING_SELECTOR = `[${FAQ_TRACKING_DATA_ATTRIBUTE}]`;
const HOME_CATEGORY_CLICK_ORIGIN_SELECTOR = `[${HOME_CATEGORY_CLICK_ORIGIN_DATA_ATTRIBUTE}]`;
const MOBILE_BOTTOM_NAVIGATION_TRACKING_SELECTOR = `[${MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE}]`;
const MOBILE_NAVIGATION_CLICK_ORIGIN_SELECTOR = `[${MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE}]`;
const PRODUCT_CARD_CLICK_ORIGIN_SELECTOR = `[${PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE}]`;
const SECTION_HEADER_CLICK_ORIGIN_SELECTOR = `[${SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE}]`;

type CustomerServiceTrackingType = "call" | "email" | "whatsapp";

export function ClickOriginListener() {
  const handleClickCapture = useEffectEvent((event: MouseEvent) => {
    if (!isPlainLeftClick(event)) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const bannerLink = target.closest(BANNER_TRACKING_SELECTOR);

    if (bannerLink instanceof HTMLElement) {
      const bannerTrackingData = parseBannerTrackingData(
        bannerLink.getAttribute(BANNER_TRACKING_DATA_ATTRIBUTE)
      );

      if (bannerTrackingData) {
        bannerTrackingManager.trackClick(bannerTrackingData.elementId, {
          innerPosition: bannerTrackingData.bannerInnerPosition,
          lpId: bannerTrackingData.bannerLpId,
          origin: bannerTrackingData.bannerOrigin,
          style: bannerTrackingData.bannerStyle,
          type: bannerTrackingData.bannerType,
        });
        setBannerClickOrigin(bannerTrackingData);
      }

      return;
    }

    const customerServiceLink = target.closest(
      CUSTOMER_SERVICE_TRACKING_SELECTOR
    );

    if (customerServiceLink instanceof HTMLElement) {
      const trackingType = customerServiceLink.getAttribute(
        CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE
      ) as CustomerServiceTrackingType | null;

      switch (trackingType) {
        case "call":
          trackCsCall();
          return;
        case "email":
          trackCsEmail();
          return;
        case "whatsapp":
          trackCsWhatsapp();
          return;
        default:
          break;
      }
    }

    const faqLink = target.closest(FAQ_TRACKING_SELECTOR);

    if (faqLink instanceof HTMLElement) {
      const section = faqLink.getAttribute(FAQ_TRACKING_DATA_ATTRIBUTE);

      if (section) {
        try {
          trackFaqPageOpen({ section });
        } catch {}
      }

      return;
    }

    const homeCategoryLink = target.closest(
      HOME_CATEGORY_CLICK_ORIGIN_SELECTOR
    );

    if (homeCategoryLink instanceof HTMLElement) {
      const clickOrigin = parseHomeCategoryClickOrigin(
        homeCategoryLink.getAttribute(HOME_CATEGORY_CLICK_ORIGIN_DATA_ATTRIBUTE)
      );

      if (clickOrigin) {
        clickOriginTrackingManager.setClickOrigin(clickOrigin);
      }

      return;
    }

    const desktopNavigationLink = target.closest(
      DESKTOP_NAVIGATION_TRACKING_SELECTOR
    );

    if (desktopNavigationLink instanceof HTMLElement) {
      const trackingPayload = parseDesktopNavigationTrackingPayload(
        desktopNavigationLink.getAttribute(
          DESKTOP_NAVIGATION_TRACKING_DATA_ATTRIBUTE
        )
      );

      if (trackingPayload) {
        const pathname = window.location.pathname;

        clickOriginTrackingManager.setClickOrigin({
          lp_id: getCurrentDesktopNavigationLpId(pathname),
          origin: "top_menu",
          position: trackingPayload.position,
        });

        trackDesktopNavigation(
          {
            category_id: trackingPayload.categoryId,
            lp_id: trackingPayload.lpId,
            lp_name: trackingPayload.lpName,
            title: trackingPayload.title,
            type: "webview",
            url_type: trackingPayload.urlType,
          },
          trackingPayload.categoryMeta
        );
      }

      return;
    }

    const mobileNavigationElement = target.closest(
      MOBILE_NAVIGATION_CLICK_ORIGIN_SELECTOR
    );

    if (mobileNavigationElement instanceof HTMLElement) {
      const clickOriginPayload = parseMobileNavigationClickOriginPayload(
        mobileNavigationElement.getAttribute(
          MOBILE_NAVIGATION_CLICK_ORIGIN_DATA_ATTRIBUTE
        )
      );

      if (clickOriginPayload) {
        clickOriginTrackingManager.setClickOrigin({
          lp_id: getCurrentLpId(window.location.pathname),
          origin: "top_menu",
          position: clickOriginPayload.position,
        });
      }

      return;
    }

    const mobileBottomNavigationLink = target.closest(
      MOBILE_BOTTOM_NAVIGATION_TRACKING_SELECTOR
    );

    if (mobileBottomNavigationLink instanceof HTMLElement) {
      const mobileBottomNavigationItem =
        mobileBottomNavigationLink.getAttribute(
          MOBILE_BOTTOM_NAVIGATION_TRACKING_DATA_ATTRIBUTE
        );

      if (mobileBottomNavigationItem) {
        trackMenuClick(mobileBottomNavigationItem);
      }

      return;
    }

    const productCardLink = target.closest(PRODUCT_CARD_CLICK_ORIGIN_SELECTOR);

    if (productCardLink instanceof HTMLElement) {
      const clickOrigin = parseProductCardClickOrigin(
        productCardLink.getAttribute(PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE)
      );

      if (clickOrigin) {
        setProductCardClickOrigin(clickOrigin);
      }

      return;
    }

    const sectionHeaderLink = target.closest(
      SECTION_HEADER_CLICK_ORIGIN_SELECTOR
    );

    if (!(sectionHeaderLink instanceof HTMLElement)) {
      return;
    }

    const clickOrigin = parseSectionHeaderClickOrigin(
      sectionHeaderLink.getAttribute(SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE)
    );

    if (!clickOrigin) {
      return;
    }

    setSectionHeaderClickOrigin(clickOrigin);
  });

  useEffect(() => {
    document.addEventListener("click", handleClickCapture, true);

    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, []);

  return null;
}

function isPlainLeftClick(event: MouseEvent) {
  return !(
    event.button !== 0 ||
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
