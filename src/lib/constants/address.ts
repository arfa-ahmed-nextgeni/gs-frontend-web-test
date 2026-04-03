export const enum AddressStepType {
  Area = "area",
  City = "city",
  Country = "country",
  State = "state",
}

export const ADD_ADDRESS_STEPS = [
  AddressStepType.Country,
  AddressStepType.State,
  AddressStepType.City,
  AddressStepType.Area,
] as const;
