import { useSyncExternalStore } from "react";

import {
  getServerWindowFocusWithin,
  getWindowFocusWithin,
  subscribeWindowFocus,
} from "@/lib/stores/window-focus-store";

export function useWindowFocusWithin() {
  return useSyncExternalStore(
    subscribeWindowFocus,
    getWindowFocusWithin,
    getServerWindowFocusWithin
  );
}
