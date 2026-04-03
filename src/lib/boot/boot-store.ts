import "client-only";

import {
  getWindowFocusInVersion,
  subscribeWindowFocus,
} from "@/lib/stores/window-focus-store";
import { waitForWindowLoad } from "@/lib/stores/window-load-store";

const bootStoreListeners = new Set<() => void>();
const interactionPromiseResolvers = new Map<string, Set<() => void>>();
const interactionPromisesByThresholdKey = new Map<string, Promise<void>>();
const interactionThresholds = new Map<
  string,
  { pointerMoveThresholdPx: number; scrollThresholdPx: number }
>();
let bootStoreVersion = 0;
let hasInteracted = false;
let hasScrolled = false;
let maxPointerMove = 0;
let pointerStartPosition: { x: number; y: number } | null = null;
let removeGlobalListeners: (() => void) | null = null;
let removeScrollListener: (() => void) | null = null;
let syncScrollInteractionListener: (() => void) | null = null;
const triggeredPolicyKeys = new Set<string>();

export function getBootStoreSnapshot() {
  return bootStoreVersion;
}

export function getServerBootStoreSnapshot() {
  return 0;
}

export function hasBootPolicyTriggered(policyKey: string) {
  return triggeredPolicyKeys.has(policyKey);
}

export function markBootPolicyTriggered(policyKey: string) {
  if (triggeredPolicyKeys.has(policyKey)) {
    return;
  }

  triggeredPolicyKeys.add(policyKey);
  notifyBootStore();
}

export function subscribeBootStore(listener: () => void) {
  bootStoreListeners.add(listener);

  if (typeof window !== "undefined" && bootStoreListeners.size === 1) {
    ensureGlobalBootListeners();
  }

  return () => {
    bootStoreListeners.delete(listener);

    if (bootStoreListeners.size === 0 && removeGlobalListeners) {
      removeGlobalListeners();
      removeGlobalListeners = null;
    }
  };
}

export function waitForInteractionSignal(
  scrollThresholdPx: number,
  pointerMoveThresholdPx: number
) {
  ensureGlobalBootListeners();

  if (
    hasInteracted ||
    maxPointerMove >= pointerMoveThresholdPx ||
    (scrollThresholdPx > 0 && hasScrolled)
  ) {
    return Promise.resolve();
  }

  const interactionThresholdKey = getInteractionThresholdKey(
    scrollThresholdPx,
    pointerMoveThresholdPx
  );
  const existingPromise = interactionPromisesByThresholdKey.get(
    interactionThresholdKey
  );

  if (existingPromise) {
    return existingPromise;
  }

  interactionThresholds.set(interactionThresholdKey, {
    pointerMoveThresholdPx,
    scrollThresholdPx,
  });
  syncScrollInteractionListener?.();

  const interactionPromise = new Promise<void>((resolve) => {
    const resolvers =
      interactionPromiseResolvers.get(interactionThresholdKey) ?? new Set();
    resolvers.add(resolve);
    interactionPromiseResolvers.set(interactionThresholdKey, resolvers);
  }).finally(() => {
    interactionPromisesByThresholdKey.delete(interactionThresholdKey);
  });

  interactionPromisesByThresholdKey.set(
    interactionThresholdKey,
    interactionPromise
  );

  return interactionPromise;
}

export function waitForLoadSignal() {
  return waitForWindowLoad();
}

function ensureGlobalBootListeners() {
  if (removeGlobalListeners || typeof window === "undefined") {
    return;
  }

  maxPointerMove = 0;
  hasScrolled = false;
  pointerStartPosition = null;

  const cleanupTasks = new Set<() => void>();

  const addListener = (
    target: Window,
    type: keyof WindowEventMap,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    cleanupTasks.add(() => {
      target.removeEventListener(type, listener, options);
    });
  };

  const completeInteraction = () => {
    if (hasInteracted) {
      return;
    }

    hasInteracted = true;
    resolveInteractionThresholds();
    notifyBootStore();
  };

  const handleScroll = () => {
    if (hasScrolled) {
      return;
    }

    hasScrolled = true;
    resolveInteractionThresholds();
    notifyBootStore();
    syncScrollInteractionListener?.();
  };

  const handlePointerMove: EventListener = (event) => {
    const pointerEvent = event as PointerEvent;

    if (pointerEvent.pointerType !== "mouse") {
      return;
    }

    if (!pointerStartPosition) {
      pointerStartPosition = {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      };
      return;
    }

    const nextPointerMove = Math.hypot(
      pointerEvent.clientX - pointerStartPosition.x,
      pointerEvent.clientY - pointerStartPosition.y
    );

    if (nextPointerMove <= maxPointerMove) {
      return;
    }

    maxPointerMove = nextPointerMove;
    resolveInteractionThresholds();
    notifyBootStore();
  };

  if (!hasInteracted) {
    let lastFocusInVersion = getWindowFocusInVersion();

    addListener(window, "pointerdown", completeInteraction, {
      once: true,
      passive: true,
    });
    addListener(window, "pointermove", handlePointerMove, {
      passive: true,
    });
    addListener(window, "keydown", completeInteraction, {
      once: true,
      passive: true,
    });
    addListener(window, "touchstart", completeInteraction, {
      once: true,
      passive: true,
    });
    addListener(window, "wheel", completeInteraction, {
      once: true,
      passive: true,
    });
    cleanupTasks.add(
      subscribeWindowFocus(() => {
        const nextFocusInVersion = getWindowFocusInVersion();

        if (nextFocusInVersion <= lastFocusInVersion) {
          return;
        }

        lastFocusInVersion = nextFocusInVersion;
        completeInteraction();
      })
    );
  }

  syncScrollInteractionListener = () => {
    const shouldListenForScroll = shouldTrackScrollInteraction();

    if (!shouldListenForScroll || hasScrolled) {
      if (removeScrollListener) {
        removeScrollListener();
        removeScrollListener = null;
      }

      return;
    }

    if (removeScrollListener) {
      return;
    }

    window.addEventListener("scroll", handleScroll, {
      once: true,
      passive: true,
    });
    removeScrollListener = () => {
      window.removeEventListener("scroll", handleScroll);
    };
  };

  syncScrollInteractionListener();

  removeGlobalListeners = () => {
    if (removeScrollListener) {
      removeScrollListener();
      removeScrollListener = null;
    }

    syncScrollInteractionListener = null;
    cleanupTasks.forEach((cleanup) => cleanup());
    cleanupTasks.clear();
  };
}

function getInteractionThresholdKey(
  scrollThresholdPx: number,
  pointerMoveThresholdPx: number
) {
  return JSON.stringify({
    pointerMoveThresholdPx,
    scrollThresholdPx,
  });
}

function notifyBootStore() {
  bootStoreVersion += 1;
  bootStoreListeners.forEach((listener) => {
    listener();
  });
}

function resolveInteractionThresholds() {
  if (hasInteracted) {
    interactionPromiseResolvers.forEach(
      (resolvers, interactionThresholdKey) => {
        resolvers.forEach((resolve) => resolve());
        interactionPromiseResolvers.delete(interactionThresholdKey);
        interactionThresholds.delete(interactionThresholdKey);
      }
    );
    syncScrollInteractionListener?.();
    return;
  }

  interactionThresholds.forEach(
    (
      { pointerMoveThresholdPx, scrollThresholdPx },
      interactionThresholdKey
    ) => {
      if (
        maxPointerMove < pointerMoveThresholdPx &&
        !(scrollThresholdPx > 0 && hasScrolled)
      ) {
        return;
      }

      const resolvers = interactionPromiseResolvers.get(
        interactionThresholdKey
      );
      resolvers?.forEach((resolve) => resolve());
      interactionPromiseResolvers.delete(interactionThresholdKey);
      interactionThresholds.delete(interactionThresholdKey);
    }
  );

  syncScrollInteractionListener?.();
}

function shouldTrackScrollInteraction() {
  for (const { scrollThresholdPx } of interactionThresholds.values()) {
    if (scrollThresholdPx > 0) {
      return true;
    }
  }

  return false;
}
