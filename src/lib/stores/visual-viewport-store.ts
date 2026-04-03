import { subscribeWindowSize } from "@/lib/stores/window-size-store";

type Listener = () => void;

type VisualViewportState = {
  hasVisualViewport: boolean;
  height: number;
  offsetTop: number;
  width: number;
};

const DEFAULT_VISUAL_VIEWPORT_STATE: VisualViewportState = {
  hasVisualViewport: false,
  height: 0,
  offsetTop: 0,
  width: 0,
};

const listeners = new Set<Listener>();

let currentVisualViewportState = DEFAULT_VISUAL_VIEWPORT_STATE;
let cleanupFallbackSubscription: (() => void) | null = null;

export function getServerVisualViewportState() {
  return DEFAULT_VISUAL_VIEWPORT_STATE;
}

export function getVisualViewportState() {
  if (typeof window === "undefined") {
    return DEFAULT_VISUAL_VIEWPORT_STATE;
  }

  const nextVisualViewportState = readVisualViewportState();

  if (
    currentVisualViewportState.hasVisualViewport ===
      nextVisualViewportState.hasVisualViewport &&
    currentVisualViewportState.height === nextVisualViewportState.height &&
    currentVisualViewportState.offsetTop ===
      nextVisualViewportState.offsetTop &&
    currentVisualViewportState.width === nextVisualViewportState.width
  ) {
    return currentVisualViewportState;
  }

  currentVisualViewportState = nextVisualViewportState;
  return currentVisualViewportState;
}

export function subscribeVisualViewport(listener: Listener) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  if (listeners.size === 1) {
    syncVisualViewportState();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncVisualViewportState);
      window.visualViewport.addEventListener("scroll", syncVisualViewportState);
    } else {
      cleanupFallbackSubscription = subscribeWindowSize(
        syncVisualViewportState
      );
    }
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          syncVisualViewportState
        );
        window.visualViewport.removeEventListener(
          "scroll",
          syncVisualViewportState
        );
      }

      cleanupFallbackSubscription?.();
      cleanupFallbackSubscription = null;
    }
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function readVisualViewportState(): VisualViewportState {
  if (window.visualViewport) {
    return {
      hasVisualViewport: true,
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop,
      width: window.visualViewport.width,
    };
  }

  return {
    hasVisualViewport: false,
    height: window.innerHeight,
    offsetTop: 0,
    width: window.innerWidth,
  };
}

function syncVisualViewportState() {
  const nextVisualViewportState = readVisualViewportState();

  if (
    currentVisualViewportState.hasVisualViewport ===
      nextVisualViewportState.hasVisualViewport &&
    currentVisualViewportState.height === nextVisualViewportState.height &&
    currentVisualViewportState.offsetTop ===
      nextVisualViewportState.offsetTop &&
    currentVisualViewportState.width === nextVisualViewportState.width
  ) {
    return;
  }

  currentVisualViewportState = nextVisualViewportState;
  notify();
}
