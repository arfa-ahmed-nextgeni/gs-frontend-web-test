"use client";

import { useEffect } from "react";

import {
  MOBILE_NAVIGATION_ACCORDION_SELECTOR,
  MOBILE_NAVIGATION_ROOT_SELECTOR,
  MOBILE_NAVIGATION_SECTION_CONTROL_SELECTOR,
} from "@/layouts/header/mobile-navigation/mobile-navigation-dom-constants";

export function MobileNavigationAccordionResetOnSectionChange() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      MOBILE_NAVIGATION_ROOT_SELECTOR
    );

    if (!root) {
      return;
    }

    const sectionControls = root.querySelectorAll<HTMLInputElement>(
      MOBILE_NAVIGATION_SECTION_CONTROL_SELECTOR
    );

    if (sectionControls.length === 0) {
      return;
    }

    const closeAllAccordions = () => {
      const accordions = root.querySelectorAll<HTMLDetailsElement>(
        MOBILE_NAVIGATION_ACCORDION_SELECTOR
      );

      accordions.forEach((accordion) => {
        accordion.open = false;
      });
    };

    sectionControls.forEach((control) => {
      control.addEventListener("change", closeAllAccordions);
    });

    return () => {
      sectionControls.forEach((control) => {
        control.removeEventListener("change", closeAllAccordions);
      });
    };
  }, []);

  return null;
}
