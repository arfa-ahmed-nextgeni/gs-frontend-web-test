"use client";

import { useSyncExternalStore } from "react";

import {
  getServerWindowSize,
  getWindowSize,
  subscribeWindowSize,
} from "@/lib/stores/window-size-store";

type WindowDimensions = {
  height?: number;
  width?: number;
};

export const useWindowSize = (): WindowDimensions => {
  return useSyncExternalStore(
    subscribeWindowSize,
    getWindowSize,
    getServerWindowSize
  );
};
