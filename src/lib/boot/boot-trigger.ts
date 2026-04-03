import "client-only";

import {
  hasBootPolicyTriggered,
  markBootPolicyTriggered,
  waitForInteractionSignal,
  waitForLoadSignal,
} from "@/lib/boot/boot-store";
import {
  DEFAULT_DELAY_AFTER_LOAD_MS,
  DEFAULT_MAX_IDLE_WAIT_MS,
  DEFAULT_POINTER_MOVE_THRESHOLD_PX,
  DEFAULT_SCROLL_THRESHOLD_PX,
} from "@/lib/boot/config/boot-presets";
import { BOOT_STRATEGY } from "@/lib/boot/constants/boot-strategy";

import type { BootPolicy } from "@/lib/types/boot";

type ResolvedBootPolicy = {
  delayAfterLoadMs: number;
  maxIdleWaitMs: number;
  pointerMoveThresholdPx: number;
  scrollThresholdPx: number;
  strategy: BootPolicy["strategy"];
};

const triggerPromisesByPolicyKey = new Map<string, Promise<void>>();

export function hasBootTriggered(policy: BootPolicy) {
  const resolvedPolicy = resolveBootPolicy(policy);

  if (resolvedPolicy.strategy === BOOT_STRATEGY.IMMEDIATE) {
    return true;
  }

  return hasBootPolicyTriggered(getBootPolicyKey(resolvedPolicy));
}

export function waitForBoot(policy: BootPolicy): Promise<void> {
  const resolvedPolicy = resolveBootPolicy(policy);

  if (
    resolvedPolicy.strategy === BOOT_STRATEGY.IMMEDIATE ||
    typeof window === "undefined"
  ) {
    return Promise.resolve();
  }

  const policyKey = getBootPolicyKey(resolvedPolicy);

  if (hasBootPolicyTriggered(policyKey)) {
    return Promise.resolve();
  }

  const existingPromise = triggerPromisesByPolicyKey.get(policyKey);

  if (existingPromise) {
    return existingPromise;
  }

  const triggerPromise = new Promise<void>((resolve) => {
    const complete = () => {
      if (hasBootPolicyTriggered(policyKey)) {
        return;
      }

      markBootPolicyTriggered(policyKey);
      resolve();
    };

    const waitForLoadIdleFallback = () =>
      waitForLoadSignal().then(
        () =>
          new Promise<void>((resolveLoadIdleFallback) => {
            const timeoutId = window.setTimeout(() => {
              if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(
                  () => {
                    resolveLoadIdleFallback();
                  },
                  {
                    timeout: resolvedPolicy.maxIdleWaitMs,
                  }
                );

                return;
              }

              resolveLoadIdleFallback();
            }, resolvedPolicy.delayAfterLoadMs);

            void timeoutId;
          })
      );

    if (resolvedPolicy.strategy === BOOT_STRATEGY.AFTER_LOAD) {
      void waitForLoadSignal().then(complete);
      return;
    }

    if (resolvedPolicy.strategy === BOOT_STRATEGY.INTERACTION) {
      void waitForInteractionSignal(
        resolvedPolicy.scrollThresholdPx,
        resolvedPolicy.pointerMoveThresholdPx
      ).then(complete);
      return;
    }

    if (resolvedPolicy.strategy === BOOT_STRATEGY.INTERACTION_OR_AFTER_LOAD) {
      void Promise.race([
        waitForInteractionSignal(
          resolvedPolicy.scrollThresholdPx,
          resolvedPolicy.pointerMoveThresholdPx
        ),
        waitForLoadSignal(),
      ]).then(complete);
      return;
    }

    if (resolvedPolicy.strategy === BOOT_STRATEGY.LOAD_IDLE_FALLBACK) {
      void waitForLoadIdleFallback().then(complete);
      return;
    }

    if (
      resolvedPolicy.strategy ===
      BOOT_STRATEGY.INTERACTION_OR_LOAD_IDLE_FALLBACK
    ) {
      void Promise.race([
        waitForInteractionSignal(
          resolvedPolicy.scrollThresholdPx,
          resolvedPolicy.pointerMoveThresholdPx
        ),
        waitForLoadIdleFallback(),
      ]).then(complete);
    }
  }).finally(() => {
    triggerPromisesByPolicyKey.delete(policyKey);
  });

  triggerPromisesByPolicyKey.set(policyKey, triggerPromise);

  return triggerPromise;
}

function getBootPolicyKey(policy: ResolvedBootPolicy) {
  return JSON.stringify(policy);
}

function resolveBootPolicy(policy: BootPolicy): ResolvedBootPolicy {
  return {
    delayAfterLoadMs: policy.delayAfterLoadMs ?? DEFAULT_DELAY_AFTER_LOAD_MS,
    maxIdleWaitMs: policy.maxIdleWaitMs ?? DEFAULT_MAX_IDLE_WAIT_MS,
    pointerMoveThresholdPx:
      policy.pointerMoveThresholdPx ?? DEFAULT_POINTER_MOVE_THRESHOLD_PX,
    scrollThresholdPx: policy.scrollThresholdPx ?? DEFAULT_SCROLL_THRESHOLD_PX,
    strategy: policy.strategy,
  };
}
