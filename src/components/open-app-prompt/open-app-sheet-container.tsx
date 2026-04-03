"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { useCookieConsent } from "@/contexts/cookie-consent-context";

import type { OpenAppPromptModel } from "@/lib/models/open-app-prompt-model";

const OpenAppSheet = dynamic(
  () =>
    import("@/components/open-app-prompt/open-app-sheet").then(
      (mod) => mod.OpenAppSheet
    ),
  { ssr: false }
);

export function OpenAppSheetContainer({
  openAppPrompt,
}: {
  openAppPrompt?: OpenAppPromptModel;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const { cookieConsentStatus } = useCookieConsent();

  useEffect(() => {
    setShouldRender(true);
  }, []);

  if (
    !shouldRender ||
    cookieConsentStatus === "loading" ||
    cookieConsentStatus === "pending"
  )
    return null;
  if (!openAppPrompt) return null;

  return (
    <AsyncBoundary fallback={null}>
      <OpenAppSheet openAppPrompt={openAppPrompt} />
    </AsyncBoundary>
  );
}
