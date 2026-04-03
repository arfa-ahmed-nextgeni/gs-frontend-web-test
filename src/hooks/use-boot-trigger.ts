import { useEffect, useSyncExternalStore } from "react";

import {
  getBootStoreSnapshot,
  getServerBootStoreSnapshot,
  subscribeBootStore,
} from "@/lib/boot/boot-store";
import { hasBootTriggered, waitForBoot } from "@/lib/boot/boot-trigger";

import type { BootPolicy } from "@/lib/types/boot";

export function useBootTrigger(enabled: boolean, policy: BootPolicy) {
  useSyncExternalStore(
    subscribeBootStore,
    getBootStoreSnapshot,
    getServerBootStoreSnapshot
  );
  const shouldBoot = enabled && hasBootTriggered(policy);

  useEffect(() => {
    if (!enabled || shouldBoot) {
      return;
    }

    void waitForBoot(policy);
  }, [enabled, policy, shouldBoot]);

  return shouldBoot;
}
