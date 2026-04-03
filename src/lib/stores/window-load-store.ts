type Listener = () => void;

const listeners = new Set<Listener>();

let hasLoaded = false;
let loadPromise: null | Promise<void> = null;
let loadPromiseResolver: (() => void) | null = null;
let removeWindowLoadListener: (() => void) | null = null;

export function getServerWindowLoaded() {
  return false;
}

export function getWindowLoaded() {
  if (typeof window === "undefined") {
    return false;
  }

  if (document.readyState === "complete") {
    completeWindowLoad();
  }

  return hasLoaded;
}

export function subscribeWindowLoad(listener: Listener) {
  listeners.add(listener);

  if (typeof window !== "undefined" && listeners.size === 1) {
    ensureWindowLoadListener();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && removeWindowLoadListener) {
      removeWindowLoadListener();
      removeWindowLoadListener = null;
    }
  };
}

export function waitForWindowLoad() {
  if (typeof window === "undefined" || getWindowLoaded()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve) => {
    loadPromiseResolver = () => {
      resolve();
      loadPromise = null;
      loadPromiseResolver = null;
    };
  });

  ensureWindowLoadListener();
  return loadPromise;
}

function completeWindowLoad() {
  if (hasLoaded) {
    return;
  }

  hasLoaded = true;
  loadPromiseResolver?.();
  removeWindowLoadListener?.();
  removeWindowLoadListener = null;
  notify();
}

function ensureWindowLoadListener() {
  if (removeWindowLoadListener || typeof window === "undefined") {
    return;
  }

  if (document.readyState === "complete") {
    completeWindowLoad();
    return;
  }

  const handleLoad = () => {
    completeWindowLoad();
  };

  window.addEventListener("load", handleLoad, { once: true });

  removeWindowLoadListener = () => {
    window.removeEventListener("load", handleLoad);
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}
