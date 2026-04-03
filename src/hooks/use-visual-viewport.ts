"use client";

import { useSyncExternalStore } from "react";

import {
  getServerVisualViewportState,
  getVisualViewportState,
  subscribeVisualViewport,
} from "@/lib/stores/visual-viewport-store";

export function useVisualViewport() {
  return useSyncExternalStore(
    subscribeVisualViewport,
    getVisualViewportState,
    getServerVisualViewportState
  );
}
