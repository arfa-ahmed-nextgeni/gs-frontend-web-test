export const PRICE_RANGE_BOUNDS = {
  MAX: 10000,
  MIN: 0,
} as const;

// Adobe product-search treats upper bound as exclusive (< to).
// Used to emulate inclusive exact-price filtering when min === max.
export const PRICE_UPPER_BOUND_INCLUSIVE_STEP = 0.01;
