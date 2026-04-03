export type WindowStorageEventSnapshot = {
  key: null | string;
  newValue: null | string;
  oldValue: null | string;
  storageArea: StorageAreaType;
  url: string;
  version: number;
};

type Listener = () => void;

type StorageAreaType = "localStorage" | "sessionStorage" | null;

const DEFAULT_WINDOW_STORAGE_EVENT: WindowStorageEventSnapshot = {
  key: null,
  newValue: null,
  oldValue: null,
  storageArea: null,
  url: "",
  version: 0,
};

const listeners = new Set<Listener>();

let currentWindowStorageEvent = DEFAULT_WINDOW_STORAGE_EVENT;
let removeWindowStorageListener: (() => void) | null = null;

export function getServerWindowStorageEvent() {
  return DEFAULT_WINDOW_STORAGE_EVENT;
}

export function getWindowStorageEvent() {
  return currentWindowStorageEvent;
}

export function subscribeWindowStorage(listener: Listener) {
  listeners.add(listener);

  if (typeof window !== "undefined" && listeners.size === 1) {
    ensureWindowStorageListener();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && removeWindowStorageListener) {
      removeWindowStorageListener();
      removeWindowStorageListener = null;
    }
  };
}

function ensureWindowStorageListener() {
  if (removeWindowStorageListener || typeof window === "undefined") {
    return;
  }

  const handleStorage = (event: StorageEvent) => {
    syncWindowStorageEvent(event);
  };

  window.addEventListener("storage", handleStorage);

  removeWindowStorageListener = () => {
    window.removeEventListener("storage", handleStorage);
  };
}

function getStorageAreaType(storageArea: null | Storage): StorageAreaType {
  if (typeof window === "undefined" || storageArea === null) {
    return null;
  }

  if (storageArea === window.localStorage) {
    return "localStorage";
  }

  if (storageArea === window.sessionStorage) {
    return "sessionStorage";
  }

  return null;
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function syncWindowStorageEvent(event: StorageEvent) {
  currentWindowStorageEvent = {
    key: event.key,
    newValue: event.newValue,
    oldValue: event.oldValue,
    storageArea: getStorageAreaType(event.storageArea),
    url: event.url,
    version: currentWindowStorageEvent.version + 1,
  };

  notify();
}
