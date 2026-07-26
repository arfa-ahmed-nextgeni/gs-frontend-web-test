if ("serviceWorker" in navigator) {
  void navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.allSettled(
        registrations.map((registration) => registration.unregister()),
      ),
    )
    .catch(() => undefined);
}
