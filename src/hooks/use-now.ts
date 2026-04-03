"use client";

import { useSyncExternalStore } from "react";

import { getNow, getServerNow, subscribeNow } from "@/lib/stores/time-store";

export function useNow() {
  return useSyncExternalStore(subscribeNow, getNow, getServerNow);
}
