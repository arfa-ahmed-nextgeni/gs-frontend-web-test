import dayjs, { type Dayjs } from "dayjs";

type Listener = () => void;

const TIME_TICK_INTERVAL_MS = 1000;
const listeners = new Set<Listener>();

let currentNow: Dayjs | null = null;
let timerId: null | number = null;

export function getNow() {
  return currentNow;
}

export function getServerNow() {
  return null;
}

export function subscribeNow(listener: Listener) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  if (listeners.size === 1) {
    startClock();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      stopClock();
    }
  };
}

function notify() {
  listeners.forEach((listener) => {
    listener();
  });
}

function startClock() {
  syncNow();
  timerId = window.setInterval(syncNow, TIME_TICK_INTERVAL_MS);
}

function stopClock() {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }

  currentNow = null;
}

function syncNow() {
  const nextNow = dayjs();

  if (currentNow?.valueOf() === nextNow.valueOf()) {
    return;
  }

  currentNow = nextNow;
  notify();
}
