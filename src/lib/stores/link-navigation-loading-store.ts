type Listener = () => void;

let pendingLinksCount = 0;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

export const addPendingLink = () => {
  pendingLinksCount += 1;
  notify();
};

export const removePendingLink = () => {
  pendingLinksCount = Math.max(0, pendingLinksCount - 1);
  notify();
};

export const subscribePendingLinks = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const isAnyLinkPending = () => pendingLinksCount > 0;
