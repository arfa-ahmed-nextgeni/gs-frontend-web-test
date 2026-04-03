export const ADD_PICKUP_POINT_STEPS = {
  ADDRESS_FORM: 1,
  LOCATION_SELECTION: 0,
} as const;

export type AddPickupPointStep =
  (typeof ADD_PICKUP_POINT_STEPS)[keyof typeof ADD_PICKUP_POINT_STEPS];
