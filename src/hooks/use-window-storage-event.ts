import { useSyncExternalStore } from "react";

import {
  getServerWindowStorageEvent,
  getWindowStorageEvent,
  subscribeWindowStorage,
} from "@/lib/stores/window-storage-store";

export function useWindowStorageEvent() {
  return useSyncExternalStore(
    subscribeWindowStorage,
    getWindowStorageEvent,
    getServerWindowStorageEvent
  );
}
