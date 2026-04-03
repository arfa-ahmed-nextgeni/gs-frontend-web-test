"use client";

import { useSyncExternalStore } from "react";

import {
  isAnyLinkPending,
  subscribePendingLinks,
} from "@/lib/stores/link-navigation-loading-store";
import { cn } from "@/lib/utils";

export const GlobalLinkLoadingBar = () => {
  const isPending = useSyncExternalStore(
    subscribePendingLinks,
    isAnyLinkPending,
    () => false
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 transition-opacity duration-200",
        isPending ? "opacity-100 delay-0" : "opacity-0 delay-200"
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="bg-bg-primary/15 h-full w-full" />
        <div
          className={cn(
            "bg-bg-primary absolute inset-y-0 left-0 w-full will-change-transform",
            isPending
              ? "global-link-loading-progress-running"
              : "global-link-loading-progress-complete"
          )}
        />
      </div>
    </div>
  );
};
