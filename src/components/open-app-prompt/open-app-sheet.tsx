"use client";

import { useEffect, useState, useTransition } from "react";

import Image from "next/image";

import { useLocale } from "next-intl";

import GoldenScentLogoAr from "@/assets/logos/golden-scent-logo-ar.svg";
import GoldenScentLogoEn from "@/assets/logos/golden-scent-logo-en.svg";
import { ProductRating } from "@/components/product/product-rating";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { trackGoOnApp, trackStayOnWeb } from "@/lib/analytics/events";
import { QueryParamsKey } from "@/lib/constants/query-params";
import { ROUTES } from "@/lib/constants/routes";
import { SessionStorageKey } from "@/lib/constants/session-storage";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";
import { getLocaleInfo } from "@/lib/utils/locale";
import {
  getSessionStorage,
  setSessionStorage,
} from "@/lib/utils/session-storage";

import type { OpenAppPromptModel } from "@/lib/models/open-app-prompt-model";

export function OpenAppSheet({
  openAppPrompt: {
    appRating,
    appStoreUrl,
    dismissButtonLabel,
    openAppButtonLabel,
    playStoreUrl,
    subtitle,
    title,
  },
}: {
  openAppPrompt: OpenAppPromptModel;
}) {
  const locale = useLocale();
  const isMobile = useIsMobile();
  const isMobileBottomNavHidden = useIsMobileBottomNavHidden();
  const [isNavigatingToApp, startNavigatingToApp] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = getLocaleInfo(locale);
  const fallbackLogoSrc =
    language === "ar" ? GoldenScentLogoAr : GoldenScentLogoEn;
  const normalizedAppRating = normalizeAppRating(appRating);

  useEffect(() => {
    if (!isMobile) return;
    if (!playStoreUrl && !appStoreUrl) return;
    if (getStoredPopupState()) return;

    let firstAnimationFrameId = 0;
    let secondAnimationFrameId = 0;

    firstAnimationFrameId = window.requestAnimationFrame(() => {
      secondAnimationFrameId = window.requestAnimationFrame(() => {
        markPopupAsSeen();
        setIsOpen(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstAnimationFrameId);
      window.cancelAnimationFrame(secondAnimationFrameId);
    };
  }, [playStoreUrl, appStoreUrl, isMobile]);

  const handleOpenApp = () => {
    if (isNavigatingToApp) return;
    trackGoOnApp();
    markPopupAsSeen();
    startNavigatingToApp(() => {
      const fallbackStoreUrl = getFallbackStoreUrl(playStoreUrl, appStoreUrl);
      const targetUrl = buildOpenAppRootUrl(fallbackStoreUrl);

      if (!targetUrl) return;
      setIsOpen(false);
      openUrlInNewTab(targetUrl);
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
    }
  };

  const handleStayOnWeb = () => {
    trackStayOnWeb();
    markPopupAsSeen();
    setIsOpen(false);
  };

  if (!isMobile || (!playStoreUrl && !appStoreUrl)) {
    return null;
  }

  return (
    <Sheet modal={false} onOpenChange={handleOpenChange} open={isOpen}>
      <SheetContent
        className={cn(
          "bg-bg-body border-border-base inset-x-0 mx-0 w-full max-w-none rounded-none border-x-0 border-t p-5 shadow-none",
          isMobileBottomNavHidden
            ? "bottom-[env(safe-area-inset-bottom)]"
            : "bottom-[calc(60px+env(safe-area-inset-bottom))]",
          ZIndexLevel.Dialog
        )}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        overlayClassName="bg-transparent backdrop-blur-none"
        showCloseButton={false}
        showOverlay={false}
        side="bottom"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{subtitle}</SheetDescription>
        <div className="flex items-start gap-3">
          <div className="bg-bg-primary size-10.5 flex shrink-0 items-center justify-center rounded-xl">
            <Image
              alt="Golden Scent"
              className="h-2 w-7"
              height={8}
              src={fallbackLogoSrc}
              width={28}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-text-primary text-base font-semibold leading-none">
                {title}
              </p>
              {normalizedAppRating > 0 && (
                <ProductRating
                  hideRating
                  rating={normalizedAppRating}
                  variant="large"
                />
              )}
            </div>
            <p className="text-text-placeholder mt-1 text-sm font-medium">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            className="bg-bg-default text-text-primary border-border-base hover:bg-bg-surface h-12.5 rounded-xl border text-xl font-medium"
            disabled={isNavigatingToApp}
            onClick={handleStayOnWeb}
            type="button"
            variant="ghost"
          >
            {dismissButtonLabel}
          </Button>
          <Button
            className="bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-slate h-12.5 rounded-xl text-xl font-medium"
            disabled={isNavigatingToApp}
            onClick={handleOpenApp}
            type="button"
          >
            {isNavigatingToApp ? (
              <div className="flex w-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              openAppButtonLabel
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function buildOpenAppRootUrl(fallbackStoreUrl: string) {
  if (!fallbackStoreUrl) return "";

  const openAppRootUrl = new URL(ROUTES.ROOT, window.location.origin);
  openAppRootUrl.searchParams.set(QueryParamsKey.OpenApp, "1");
  openAppRootUrl.searchParams.set(QueryParamsKey.StoreUrl, fallbackStoreUrl);
  return openAppRootUrl.toString();
}

function getFallbackStoreUrl(playStoreUrl?: string, appStoreUrl?: string) {
  const userAgent = navigator.userAgent;
  const isAndroid = /android/i.test(userAgent);
  const isIos = /(iphone|ipad|ipod)/i.test(userAgent);

  if (isAndroid) {
    return playStoreUrl ?? appStoreUrl ?? "";
  }

  if (isIos) {
    return appStoreUrl ?? playStoreUrl ?? "";
  }

  return appStoreUrl ?? playStoreUrl ?? "";
}

function getStoredPopupState() {
  return getSessionStorage(SessionStorageKey.OPEN_APP_POPUP_SHOWN) === "1";
}

function markPopupAsSeen() {
  setSessionStorage(SessionStorageKey.OPEN_APP_POPUP_SHOWN, "1");
}

function normalizeAppRating(appRating?: number) {
  if (typeof appRating !== "number" || Number.isNaN(appRating)) {
    return 0;
  }

  const normalized = Math.max(0, Math.min(5, appRating));
  return Math.round(normalized * 2) / 2;
}

function openUrlInNewTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
