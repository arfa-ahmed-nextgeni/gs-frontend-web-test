"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";
import { DESKTOP_VIEWPORT_MEDIA_QUERY } from "@/lib/utils/responsive";

export function MenuDesktopRedirect() {
  const router = useRouter();

  useEffect(() => {
    const desktopViewport = window.matchMedia(DESKTOP_VIEWPORT_MEDIA_QUERY);

    const redirectDesktopViewport = () => {
      if (desktopViewport.matches) {
        router.replace(ROUTES.HOME, { scroll: false });
      }
    };

    redirectDesktopViewport();
    desktopViewport.addEventListener("change", redirectDesktopViewport);

    return () => {
      desktopViewport.removeEventListener("change", redirectDesktopViewport);
    };
  }, [router]);

  return null;
}
