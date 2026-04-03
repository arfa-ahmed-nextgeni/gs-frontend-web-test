import { onlineManager } from "@tanstack/react-query";

type OnlineStatusListener = () => void;

const DEFAULT_ONLINE_STATUS = true;

export function getOnlineStatus() {
  return onlineManager.isOnline();
}

export function getServerOnlineStatus() {
  return DEFAULT_ONLINE_STATUS;
}

export function isAppOnline() {
  if (typeof window === "undefined") {
    return DEFAULT_ONLINE_STATUS;
  }

  return getOnlineStatus();
}

export function subscribeOnlineStatus(listener: OnlineStatusListener) {
  return onlineManager.subscribe(() => {
    listener();
  });
}
