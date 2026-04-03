import { BOOT_STRATEGY } from "@/lib/boot/constants/boot-strategy";

import type { BootPolicy } from "@/lib/types/boot";

/**
 * If a policy waits for page load, pause this long after load first.
 */
export const DEFAULT_DELAY_AFTER_LOAD_MS = 5000;
/**
 * After that pause, give the browser this long to find an idle moment.
 */
export const DEFAULT_MAX_IDLE_WAIT_MS = 2000;
/**
 * Treat mouse or laptop touchpad pointer movement as real interaction only
 * after the pointer has moved this much.
 */
export const DEFAULT_POINTER_MOVE_THRESHOLD_PX = 24;
/**
 * Treat scroll as real interaction only after the page has moved this much.
 */
export const DEFAULT_SCROLL_THRESHOLD_PX = 16;

/**
 * Boot immediately.
 * Best for lightweight features that should be ready as soon as possible.
 */
export const IMMEDIATE_BOOT_POLICY = {
  strategy: BOOT_STRATEGY.IMMEDIATE,
} as const satisfies BootPolicy;

/**
 * Wait for a real user interaction before booting.
 *
 * Current interaction signals:
 * - pointerdown
 * - keydown
 * - touchstart
 * - wheel
 * - focusin
 * - pointermove after 'DEFAULT_POINTER_MOVE_THRESHOLD_PX'
 * - scroll after 'DEFAULT_SCROLL_THRESHOLD_PX'
 *
 * Best for heavier features that hurt Lighthouse if they start too early.
 */
export const INTERACTION_BOOT_POLICY = {
  pointerMoveThresholdPx: DEFAULT_POINTER_MOVE_THRESHOLD_PX,
  scrollThresholdPx: DEFAULT_SCROLL_THRESHOLD_PX,
  strategy: BOOT_STRATEGY.INTERACTION,
} as const satisfies BootPolicy;

/**
 * Boot on the first user interaction, or as soon as page load finishes if the
 * user has not interacted yet.
 *
 * Best for features that should avoid the critical render path but still be
 * ready soon after load.
 */
export const INTERACTION_OR_AFTER_LOAD_BOOT_POLICY = {
  pointerMoveThresholdPx: DEFAULT_POINTER_MOVE_THRESHOLD_PX,
  scrollThresholdPx: DEFAULT_SCROLL_THRESHOLD_PX,
  strategy: BOOT_STRATEGY.INTERACTION_OR_AFTER_LOAD,
} as const satisfies BootPolicy;

/**
 * Wait for the page 'load' event, then boot immediately.
 * Best for features that should not affect the critical render path but
 * should still start without requiring user interaction.
 */
export const AFTER_LOAD_BOOT_POLICY = {
  strategy: BOOT_STRATEGY.AFTER_LOAD,
} as const satisfies BootPolicy;

/**
 * Wait for page load, then boot during a delayed idle window even if the user
 * never interacts.
 *
 * Flow:
 * 1. wait for page load
 * 2. wait `delayAfterLoadMs`
 * 3. run on browser idle, but no later than `maxIdleWaitMs`
 */
export const LOAD_IDLE_FALLBACK_BOOT_POLICY = {
  delayAfterLoadMs: DEFAULT_DELAY_AFTER_LOAD_MS,
  maxIdleWaitMs: DEFAULT_MAX_IDLE_WAIT_MS,
  pointerMoveThresholdPx: DEFAULT_POINTER_MOVE_THRESHOLD_PX,
  scrollThresholdPx: DEFAULT_SCROLL_THRESHOLD_PX,
  strategy: BOOT_STRATEGY.LOAD_IDLE_FALLBACK,
} as const satisfies BootPolicy;

/**
 * Prefer user interaction, but still boot later after load/idle as a safety
 * net for no-interaction visits.
 *
 * Flow:
 * 1. boot on interaction if it happens first
 * 2. otherwise wait for page load
 * 3. wait `delayAfterLoadMs`
 * 4. run on browser idle, but no later than `maxIdleWaitMs`
 */
export const INTERACTION_OR_LOAD_IDLE_FALLBACK_BOOT_POLICY = {
  delayAfterLoadMs: DEFAULT_DELAY_AFTER_LOAD_MS,
  maxIdleWaitMs: DEFAULT_MAX_IDLE_WAIT_MS,
  pointerMoveThresholdPx: DEFAULT_POINTER_MOVE_THRESHOLD_PX,
  scrollThresholdPx: DEFAULT_SCROLL_THRESHOLD_PX,
  strategy: BOOT_STRATEGY.INTERACTION_OR_LOAD_IDLE_FALLBACK,
} as const satisfies BootPolicy;
