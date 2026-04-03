"use client";

import { useSyncExternalStore } from "react";

import {
  getOnlineStatus,
  getServerOnlineStatus,
  subscribeOnlineStatus,
} from "@/lib/stores/online-status-store";

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeOnlineStatus,
    getOnlineStatus,
    getServerOnlineStatus
  );
}
