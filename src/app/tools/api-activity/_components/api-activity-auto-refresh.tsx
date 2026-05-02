/* eslint-disable no-restricted-imports -- Standalone tools route has no next-intl context; useRouter is only used for router.refresh(). */
"use client";

import { useEffect, useTransition } from "react";

import { useRouter } from "next/navigation";

export function ApiActivityAutoRefresh({ intervalMs }: { intervalMs: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isPending) {
        return;
      }

      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, isPending, router]);

  return null;
}
