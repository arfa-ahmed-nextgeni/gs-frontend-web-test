type Listener = () => void;

type WindowFocusSnapshot = {
  focusInVersion: number;
  isFocusWithin: boolean;
};

const DEFAULT_WINDOW_FOCUS_SNAPSHOT: WindowFocusSnapshot = {
  focusInVersion: 0,
  isFocusWithin: false,
};

const listeners = new Set<Listener>();

let currentWindowFocusSnapshot = DEFAULT_WINDOW_FOCUS_SNAPSHOT;
let removeWindowFocusListeners: (() => void) | null = null;

export function getServerWindowFocusWithin() {
  return DEFAULT_WINDOW_FOCUS_SNAPSHOT.isFocusWithin;
}

export function getWindowFocusInVersion() {
  return currentWindowFocusSnapshot.focusInVersion;
}

export function getWindowFocusWithin() {
  if (typeof document === "undefined") {
    return DEFAULT_WINDOW_FOCUS_SNAPSHOT.isFocusWithin;
  }

  const nextIsFocusWithin = getIsFocusWithin();

  if (currentWindowFocusSnapshot.isFocusWithin !== nextIsFocusWithin) {
    currentWindowFocusSnapshot = {
      ...currentWindowFocusSnapshot,
      isFocusWithin: nextIsFocusWithin,
    };
  }

  return currentWindowFocusSnapshot.isFocusWithin;
}

export function subscribeWindowFocus(listener: Listener) {
  listeners.add(listener);

  if (typeof document !== "undefined" && listeners.size === 1) {
    ensureWindowFocusListeners();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && removeWindowFocusListeners) {
      removeWindowFocusListeners();
      removeWindowFocusListeners = null;
    }
  };
}

function ensureWindowFocusListeners() {
  if (removeWindowFocusListeners || typeof document === "undefined") {
    return;
  }

  syncWindowFocus(false);

  const handleFocusIn = () => {
    syncWindowFocus(true);
  };

  const handleFocusOut = () => {
    syncWindowFocus(false);
  };

  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);

  removeWindowFocusListeners = () => {
    document.removeEventListener("focusin", handleFocusIn);
    document.removeEventListener("focusout", handleFocusOut);
  };
}

function getIsFocusWithin() {
  const activeElement = document.activeElement;

  return (
    !!activeElement &&
    activeElement !== document.body &&
    activeElement !== document.documentElement
  );
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function syncWindowFocus(isFocusInEvent: boolean) {
  const nextIsFocusWithin = getIsFocusWithin();
  const nextFocusInVersion = isFocusInEvent
    ? currentWindowFocusSnapshot.focusInVersion + 1
    : currentWindowFocusSnapshot.focusInVersion;

  if (
    currentWindowFocusSnapshot.isFocusWithin === nextIsFocusWithin &&
    currentWindowFocusSnapshot.focusInVersion === nextFocusInVersion
  ) {
    return;
  }

  currentWindowFocusSnapshot = {
    focusInVersion: nextFocusInVersion,
    isFocusWithin: nextIsFocusWithin,
  };
  notify();
}
