/**
 * Shipping method carrier codes and method codes constants
 */

export const SHIPPING_CARRIER_CODES = {
  BULLET_DELIVERY: "lambdashipping_express",
  FODEL_LOCKER: "lambdashipping_fodellocker",
  REDBOX_LOCKER: "lambdashipping_redboxlocker",
} as const;

export const SHIPPING_METHOD_CODES = {
  BULLET_DELIVERY: "delivery",
  FODEL_LOCKER: "fodellocker",
  REDBOX_LOCKER: "redboxlocker",
} as const;
