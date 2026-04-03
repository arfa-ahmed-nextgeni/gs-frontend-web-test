import { useSyncExternalStore } from "react";

import {
  getServerWindowScrollY,
  getWindowScrollY,
  subscribeWindowScroll,
} from "@/lib/stores/window-scroll-store";

export function useWindowScrollY() {
  return useSyncExternalStore(
    subscribeWindowScroll,
    getWindowScrollY,
    getServerWindowScrollY
  );
}
