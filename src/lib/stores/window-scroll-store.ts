type Listener = () => void;

const listeners = new Set<Listener>();

let lastScrollAt = 0;
let removeWindowListeners: (() => void) | null = null;
let scrollY = 0;
let scrollRafId: null | number = null;

export function getServerWindowLastScrollAt() {
  return 0;
}

export function getServerWindowScrollY() {
  return 0;
}

export function getWindowLastScrollAt() {
  return lastScrollAt;
}

export function getWindowScrollY() {
  return scrollY;
}

export function subscribeWindowScroll(listener: Listener) {
  listeners.add(listener);

  if (typeof window !== "undefined" && listeners.size === 1) {
    ensureWindowScrollListeners();
    scheduleWindowScrollSync();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && removeWindowListeners) {
      removeWindowListeners();
      removeWindowListeners = null;
    }
  };
}

function ensureWindowScrollListeners() {
  if (removeWindowListeners || typeof window === "undefined") {
    return;
  }

  const handleScroll = () => {
    scheduleWindowScrollSync(Date.now());
  };

  window.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  removeWindowListeners = () => {
    if (scrollRafId != null) {
      window.cancelAnimationFrame(scrollRafId);
      scrollRafId = null;
    }

    window.removeEventListener("scroll", handleScroll);
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function readWindowScrollY() {
  if (typeof window === "undefined") {
    return scrollY;
  }

  return window.scrollY || window.pageYOffset || 0;
}

function scheduleWindowScrollSync(nextLastScrollAt = lastScrollAt) {
  if (typeof window === "undefined") {
    syncWindowScroll(nextLastScrollAt);
    return;
  }

  if (scrollRafId != null) {
    return;
  }

  scrollRafId = window.requestAnimationFrame(() => {
    scrollRafId = null;
    syncWindowScroll(nextLastScrollAt);
  });
}

function syncWindowScroll(nextLastScrollAt = lastScrollAt) {
  const nextScrollY = readWindowScrollY();

  if (nextLastScrollAt === lastScrollAt && nextScrollY === scrollY) {
    return;
  }

  lastScrollAt = nextLastScrollAt;
  scrollY = nextScrollY;
  notify();
}
