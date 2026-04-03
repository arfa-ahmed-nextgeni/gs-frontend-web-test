"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants/routes";

import type { CookieConsentPromptModel } from "@/lib/models/cookie-consent-prompt-model";

const CookieConsentSheet = dynamic(
  () =>
    import("@/components/cookie-consent/cookie-consent-sheet").then(
      (mod) => mod.CookieConsentSheet
    ),
  { ssr: false }
);

export function CookieConsentSheetContainer({
  cookieConsentPrompt,
}: {
  cookieConsentPrompt?: CookieConsentPromptModel;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const pathname = usePathname();
  const { cookieConsentStatus } = useCookieConsent();

  useEffect(() => {
    setShouldRender(true);
  }, []);

  const shouldHideOnRoute =
    pathname === ROUTES.PRIVACY || pathname === ROUTES.TERMS;

  if (
    !shouldRender ||
    !cookieConsentPrompt?.enabled ||
    cookieConsentStatus !== "pending" ||
    shouldHideOnRoute
  ) {
    return null;
  }

  return (
    <AsyncBoundary fallback={null}>
      <CookieConsentSheet cookieConsentPrompt={cookieConsentPrompt} />
    </AsyncBoundary>
  );
}
