"use client";

import { useEffect } from "react";

import {
  isAnyLinkPending,
  subscribePendingLinks,
} from "@/lib/stores/link-navigation-loading-store";

const BAR_CLASSES_BASE =
  "pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 transition-opacity duration-200";
const BAR_CLASSES_PENDING = "opacity-100 delay-0";
const BAR_CLASSES_IDLE = "opacity-0 delay-200";

const PROGRESS_CLASSES_BASE =
  "bg-bg-primary absolute inset-y-0 left-0 w-full will-change-transform";
const PROGRESS_CLASSES_PENDING = "global-link-loading-progress-running";
const PROGRESS_CLASSES_IDLE = "global-link-loading-progress-complete";

const syncBars = () => {
  if (typeof document === "undefined") return;
  const pending = isAnyLinkPending();
  const bars = document.querySelectorAll<HTMLElement>("[data-loading-bar]");
  bars.forEach((bar) => {
    bar.className = `${BAR_CLASSES_BASE} ${pending ? BAR_CLASSES_PENDING : BAR_CLASSES_IDLE}`;
    const progress = bar.querySelector<HTMLElement>(
      "[data-loading-bar-progress]"
    );
    if (progress) {
      progress.className = `${PROGRESS_CLASSES_BASE} ${pending ? PROGRESS_CLASSES_PENDING : PROGRESS_CLASSES_IDLE}`;
    }
  });
};

export const GlobalLinkLoadingBar = () => {
  useEffect(() => {
    syncBars();
    return subscribePendingLinks(syncBars);
  }, []);

  return (
    <div
      aria-hidden
      className={`${BAR_CLASSES_BASE} ${BAR_CLASSES_IDLE}`}
      data-loading-bar
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="bg-bg-primary/15 h-full w-full" />
        <div
          className={`${PROGRESS_CLASSES_BASE} ${PROGRESS_CLASSES_IDLE}`}
          data-loading-bar-progress
        />
      </div>
    </div>
  );
};
