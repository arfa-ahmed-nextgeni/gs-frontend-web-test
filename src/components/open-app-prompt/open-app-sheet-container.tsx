"use client";

import dynamic from "next/dynamic";

import { AsyncBoundary } from "@/components/common/async-boundary";
import { useCookieConsent } from "@/contexts/cookie-consent-context";
import { useBootTrigger } from "@/hooks/use-boot-trigger";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { INTERACTION_BOOT_POLICY } from "@/lib/boot/config/boot-presets";

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
  const { cookieConsentStatus } = useCookieConsent();
  const isMobile = useIsMobile();
  const hasStoreUrl = Boolean(
    openAppPrompt?.appStoreUrl || openAppPrompt?.playStoreUrl
  );
  const canAttemptPrompt =
    isMobile &&
    Boolean(openAppPrompt) &&
    hasStoreUrl &&
    cookieConsentStatus !== "loading" &&
    cookieConsentStatus !== "pending";
  const shouldRender = useBootTrigger(
    canAttemptPrompt,
    INTERACTION_BOOT_POLICY
  );

  if (!canAttemptPrompt || !shouldRender) {
    return null;
  }

  if (!openAppPrompt) return null;

  return (
    <AsyncBoundary fallback={null}>
      <OpenAppSheet openAppPrompt={openAppPrompt} />
    </AsyncBoundary>
  );
}
