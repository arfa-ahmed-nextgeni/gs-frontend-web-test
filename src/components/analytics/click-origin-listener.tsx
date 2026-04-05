"use client";

import { useEffect, useEffectEvent } from "react";

import { setBannerClickOrigin } from "@/components/analytics/utils/banner-click-origin";
import { parseBannerTrackingData } from "@/components/analytics/utils/banner-tracking-dataset";
import { setSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin";
import { parseSectionHeaderClickOrigin } from "@/components/common/section-header/utils/section-header-click-origin-dataset";
import { setProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin";
import { parseProductCardClickOrigin } from "@/components/product/product-card/utils/product-card-click-origin-dataset";
import { bannerTrackingManager } from "@/lib/analytics/banner-tracking-manager";
import {
  trackCsCall,
  trackCsEmail,
  trackCsWhatsapp,
  trackFaqPageOpen,
  trackMenuClick,
} from "@/lib/analytics/events";
import {
  BANNER_TRACKING_DATA_ATTRIBUTE,
  CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE,
  FAQ_TRACKING_DATA_ATTRIBUTE,
  MENU_TRACKING_DATA_ATTRIBUTE,
  PRODUCT_CARD_CLICK_ORIGIN_DATA_ATTRIBUTE,
  SECTION_HEADER_CLICK_ORIGIN_DATA_ATTRIBUTE,
} from "@/lib/constants/tracking-data-attributes";

const BANNER_TRACKING_SELECTOR = `[${BANNER_TRACKING_DATA_ATTRIBUTE}]`;
const CUSTOMER_SERVICE_TRACKING_SELECTOR = `[${CUSTOMER_SERVICE_TRACKING_DATA_ATTRIBUTE}]`;
const FAQ_TRACKING_SELECTOR = `[${FAQ_TRACKING_DATA_ATTRIBUTE}]`;
const MENU_TRACKING_SELECTOR = `[${MENU_TRACKING_DATA_ATTRIBUTE}]`;
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

    const menuLink = target.closest(MENU_TRACKING_SELECTOR);

    if (menuLink instanceof HTMLElement) {
      const menu = menuLink.getAttribute(MENU_TRACKING_DATA_ATTRIBUTE);

      if (menu) {
        trackMenuClick(menu);
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
