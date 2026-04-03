type Listener = () => void;

type WindowSize = {
  height: number | undefined;
  width: number | undefined;
};

const DEFAULT_WINDOW_SIZE: WindowSize = {
  height: undefined,
  width: undefined,
};

const listeners = new Set<Listener>();

let currentWindowSize: WindowSize =
  typeof window === "undefined" ? DEFAULT_WINDOW_SIZE : readWindowSize();
let removeWindowListeners: (() => void) | null = null;
let resizeRafId: null | number = null;

export function getServerWindowSize() {
  return DEFAULT_WINDOW_SIZE;
}

export function getWindowSize() {
  return currentWindowSize;
}

export function subscribeWindowSize(listener: Listener) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  if (listeners.size === 1) {
    ensureWindowSizeListeners();
    scheduleWindowSizeSync();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      removeWindowListeners?.();
      removeWindowListeners = null;
    }
  };
}

function ensureWindowSizeListeners() {
  if (removeWindowListeners || typeof window === "undefined") {
    return;
  }

  const handleResize = () => {
    scheduleWindowSizeSync();
  };

  window.addEventListener("resize", handleResize, { passive: true });

  removeWindowListeners = () => {
    if (resizeRafId != null) {
      window.cancelAnimationFrame(resizeRafId);
      resizeRafId = null;
    }

    window.removeEventListener("resize", handleResize);
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function readWindowSize() {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

function scheduleWindowSizeSync() {
  if (typeof window === "undefined") {
    syncWindowSize();
    return;
  }

  if (resizeRafId != null) {
    return;
  }

  resizeRafId = window.requestAnimationFrame(() => {
    resizeRafId = null;
    syncWindowSize();
  });
}

function syncWindowSize() {
  const nextWindowSize = readWindowSize();

  if (
    currentWindowSize.height === nextWindowSize.height &&
    currentWindowSize.width === nextWindowSize.width
  ) {
    return;
  }

  currentWindowSize = nextWindowSize;
  notify();
}
