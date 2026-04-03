"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { CookieConsentBanner } from "@/components/cookie-consent/cookie-consent-banner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useIsMobileBottomNavHidden } from "@/hooks/use-is-mobile-bottom-nav-hidden";
import { ZIndexLevel } from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

import type { CookieConsentPromptModel } from "@/lib/models/cookie-consent-prompt-model";

export function CookieConsentSheet({
  cookieConsentPrompt: { allowButtonLabel, declineButtonLabel, description },
}: {
  cookieConsentPrompt: CookieConsentPromptModel;
}) {
  const t = useTranslations("CookieConsent");
  const [isOpen, setIsOpen] = useState(false);
  const isMobileBottomNavHidden = useIsMobileBottomNavHidden();
  const { acceptCookies, declineCookies } = useCookieConsent();

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      setIsOpen(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAllow = () => {
    setIsOpen(false);
    acceptCookies();
  };

  const handleDecline = () => {
    setIsOpen(false);
    declineCookies();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
    }
  };

  return (
    <Sheet modal={false} onOpenChange={handleOpenChange} open={isOpen}>
      <SheetContent
        className={cn(
          "left-1/2 right-auto w-[95vw] max-w-none -translate-x-1/2 border-0 bg-transparent p-0 shadow-none",
          isMobileBottomNavHidden
            ? "bottom-[calc(env(safe-area-inset-bottom)+10px)]"
            : "lg:bottom-3.75 bottom-[calc(env(safe-area-inset-bottom)+70px)]",
          ZIndexLevel.z45
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
        <SheetTitle className="sr-only">{t("title")}</SheetTitle>
        <SheetDescription className="sr-only" />
        <CookieConsentBanner
          allowButtonLabel={allowButtonLabel}
          declineButtonLabel={declineButtonLabel}
          description={description}
          onAllowAction={handleAllow}
          onDeclineAction={handleDecline}
        />
      </SheetContent>
    </Sheet>
  );
}
