import { useSyncExternalStore } from "react";

import {
  getServerWindowScrollY,
  getWindowScrollY,
  subscribeWindowScroll,
} from "@/lib/stores/window-scroll-store";

export function useWindowScrollThreshold(threshold: number) {
  return useSyncExternalStore(
    subscribeWindowScroll,
    () => getWindowScrollY() > threshold,
    () => getServerWindowScrollY() > threshold
  );
}
