// Shared boot strategy identifiers for delayed client-side features.
// Keep this as an `as const` object instead of a `const enum` so it stays
// friendly with isolatedModules, SWC, and runtime debugging.
export const BOOT_STRATEGY = {
  // Initialize after the window load event fires.
  AFTER_LOAD: "after-load",

  // Initialize immediately with no waiting for interaction or page load.
  IMMEDIATE: "immediate",

  // Initialize only after a real user interaction like click, tap, keypress,
  // or meaningful scroll.
  INTERACTION: "interaction",

  // Initialize on first user interaction, otherwise as soon as the page load
  // event fires.
  INTERACTION_OR_AFTER_LOAD: "interaction-or-after-load",

  // Initialize on first user interaction, otherwise fall back after page load
  // using a delayed idle callback.
  INTERACTION_OR_LOAD_IDLE_FALLBACK: "interaction-or-load-idle-fallback",

  // Initialize after page load using a delayed idle callback, even if no
  // interaction happens.
  LOAD_IDLE_FALLBACK: "load-idle-fallback",
} as const;
