/* eslint-disable no-restricted-imports -- Standalone tools route has no next-intl context; useRouter is only used for router.refresh(). */
"use client";

import { useEffect, useTransition } from "react";

import { useRouter } from "next/navigation";

export function ApiActivityAutoRefresh({
  enabled,
  intervalMs,
}: {
  enabled: boolean;
  intervalMs: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isPending) {
        return;
      }

      const activeElement = document.activeElement;
      const shouldPauseForFocusedField =
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        (activeElement instanceof HTMLInputElement &&
          !["button", "checkbox", "radio", "reset", "submit"].includes(
            activeElement.type
          ));

      if (shouldPauseForFocusedField) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [enabled, intervalMs, isPending, router]);

  return null;
}
