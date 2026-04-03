/**
 * Controls when a client-side feature is allowed to start.
 */
export interface BootPolicy {
  /**
   * If the strategy waits for page load, wait this many milliseconds after
   * `window.load` before continuing.
   */
  delayAfterLoadMs?: number;
  /**
   * Once the browser is asked to run during idle time, wait at most this many
   * milliseconds before forcing the boot.
   */
  maxIdleWaitMs?: number;
  /**
   * Treat mouse-class pointer movement as a real interaction only after the
   * pointer has moved by at least this many pixels.
   */
  pointerMoveThresholdPx?: number;
  /**
   * Treat scroll as a real interaction only after the page has moved by at
   * least this many pixels.
   */
  scrollThresholdPx?: number;
  /**
   * The boot strategy to use for this feature.
   */
  strategy: BootStrategy;
}

export type BootStrategy =
  | "after-load"
  | "immediate"
  | "interaction-or-after-load"
  | "interaction-or-load-idle-fallback"
  | "interaction"
  | "load-idle-fallback";
